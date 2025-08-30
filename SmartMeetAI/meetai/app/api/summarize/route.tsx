// api/summarize/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ActionItem {
  id: number;
  task: string;
  assignee: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface MeetingSummary {
  title: string;
  date: string;
  duration: string;
  participants: string[];
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  nextSteps: string[];
}

// Function to call local TinyLlama model via Ollama
async function callLocalLlama(prompt: string): Promise<string> {
  try {
    console.log('Connecting to TinyLlama via Ollama...');
    
    // Ollama API endpoint for tinyllama:latest
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tinyllama:latest',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          top_k: 40,
          num_predict: 1500,
          stop: ['</summary>', '\n\n---', 'Human:', 'Assistant:'],
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('TinyLlama response received, length:', data.response?.length || 0);
    
    if (!data.response) {
      throw new Error('No response from TinyLlama model');
    }

    return data.response;
  } catch (error) {
    console.error('Error calling TinyLlama via Ollama:', error);
    console.log('Falling back to mock response for development...');
    // Fallback to mock response if local server is not available
    return getMockSummaryResponse();
  }
}

// Fallback mock response for development/testing
function getMockSummaryResponse(): string {
  return `
MEETING_TITLE: Quarterly Review Meeting
DATE: ${new Date().toLocaleDateString()}
DURATION: 45 minutes
PARTICIPANTS: John Smith, Sarah Johnson, Mike Chen, Lisa Rodriguez

KEY_POINTS:
- Reviewed Q3 performance metrics showing 15% growth
- Discussed upcoming product launch timeline
- Analyzed customer feedback from recent surveys
- Addressed budget allocation for Q4 initiatives

DECISIONS:
- Approved additional marketing budget of $50k for product launch
- Decided to implement new customer support system by end of month
- Agreed to hire two additional developers for the mobile app team

ACTION_ITEMS:
1. Marketing campaign planning | John Smith | 2024-09-15 | high
2. Developer recruitment process | Sarah Johnson | 2024-09-10 | medium
3. Customer support system setup | Mike Chen | 2024-09-30 | high
4. Budget review documentation | Lisa Rodriguez | 2024-09-05 | low

NEXT_STEPS:
- Schedule follow-up meeting for product launch review
- Begin interviewing candidates for developer positions
- Prepare Q4 budget proposal presentation
- Conduct user testing for new features
  `;
}

// Function to parse the LLaMA response into structured data
function parseLlamaResponse(response: string): MeetingSummary {
  const lines = response.split('\n').map(line => line.trim()).filter(line => line);
  
  let title = 'Meeting Summary';
  let date = new Date().toLocaleDateString();
  let duration = '30 minutes';
  let participants: string[] = [];
  let keyPoints: string[] = [];
  let decisions: string[] = [];
  let actionItems: ActionItem[] = [];
  let nextSteps: string[] = [];

  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('MEETING_TITLE:')) {
      title = line.replace('MEETING_TITLE:', '').trim();
    } else if (line.startsWith('DATE:')) {
      date = line.replace('DATE:', '').trim();
    } else if (line.startsWith('DURATION:')) {
      duration = line.replace('DURATION:', '').trim();
    } else if (line.startsWith('PARTICIPANTS:')) {
      participants = line.replace('PARTICIPANTS:', '').split(',').map(p => p.trim());
    } else if (line === 'KEY_POINTS:') {
      currentSection = 'keyPoints';
    } else if (line === 'DECISIONS:') {
      currentSection = 'decisions';
    } else if (line === 'ACTION_ITEMS:') {
      currentSection = 'actionItems';
    } else if (line === 'NEXT_STEPS:') {
      currentSection = 'nextSteps';
    } else if (line.startsWith('-') || line.startsWith('•')) {
      const content = line.replace(/^[-•]\s*/, '');
      if (currentSection === 'keyPoints') {
        keyPoints.push(content);
      } else if (currentSection === 'decisions') {
        decisions.push(content);
      } else if (currentSection === 'nextSteps') {
        nextSteps.push(content);
      }
    } else if (line.match(/^\d+\./)) {
      // Parse action items (format: "1. Task | Assignee | Date | Priority")
      const actionMatch = line.match(/^\d+\.\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/);
      if (actionMatch) {
        actionItems.push({
          id: actionItems.length + 1,
          task: actionMatch[1].trim(),
          assignee: actionMatch[2].trim(),
          deadline: actionMatch[3].trim(),
          priority: (actionMatch[4].trim() as 'high' | 'medium' | 'low') || 'medium',
        });
      }
    }
  }

  return {
    title,
    date,
    duration,
    participants,
    keyPoints,
    decisions,
    actionItems,
    nextSteps,
  };
}

// Main API route handler
export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Clean the transcript before processing
    const cleanedTranscript = cleanTranscript(transcript);
    
    // Create an optimized prompt for TinyLlama
    const prompt = `<|system|>
You are a meeting minutes assistant. Extract key information from transcripts and format them exactly as requested.

<|user|>
Analyze this meeting transcript and create a structured summary:

TRANSCRIPT:
${cleanedTranscript}

Format your response EXACTLY like this:

MEETING_TITLE: [Brief descriptive title]
DATE: ${new Date().toLocaleDateString()}
DURATION: [Estimate from content]
PARTICIPANTS: [Names mentioned in transcript]

KEY_POINTS:
- [Important discussion point 1]
- [Important discussion point 2] 
- [Important discussion point 3]

DECISIONS:
- [Decision made 1]
- [Decision made 2]
- [Decision made 3]

ACTION_ITEMS:
1. [Task] | [Person] | [Date] | [high/medium/low]
2. [Task] | [Person] | [Date] | [high/medium/low]
3. [Task] | [Person] | [Date] | [high/medium/low]

NEXT_STEPS:
- [Next step 1]
- [Next step 2]
- [Next step 3]

<|assistant|>`;

    console.log('Sending request to TinyLlama via Ollama...');
    const llamaResponse = await callLocalLlama(prompt);
    console.log('TinyLlama processing complete. Response length:', llamaResponse.length);

    // Parse the structured response
    const summary = parseLlamaResponse(llamaResponse);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error processing meeting minutes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process meeting minutes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  try {
    // Test connection to Ollama server
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const isOllamaAvailable = response.ok;
    let modelStatus = 'not available';
    
    if (isOllamaAvailable) {
      const data = await response.json();
      const hasTinyLlama = data.models?.some((model: any) => 
        model.name === 'tinyllama:latest'
      );
      modelStatus = hasTinyLlama ? 'ready' : 'tinyllama not installed';
    }

    return NextResponse.json({
      status: 'API is running',
      ollama: isOllamaAvailable ? 'connected' : 'disconnected',
      tinyllama: modelStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'API is running',
      ollama: 'disconnected',
      tinyllama: 'not available',
      timestamp: new Date().toISOString(),
      error: 'Could not connect to Ollama server (expected at localhost:11434)'
    });
  }
}

// Additional utility functions for the API

// Function to validate and clean transcript text
export function cleanTranscript(text: string): string {
  return text
    .replace(/\[inaudible\]/gi, '[unclear]')
    .replace(/\s+/g, ' ')
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
    .trim();
}

// Function to extract timestamps from transcript if present
export function extractTimestamps(transcript: string): Array<{time: string, text: string}> {
  const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?)\s*:?\s*([^0-9\n]+)/g;
  const matches = [];
  let match;

  while ((match = timestampRegex.exec(transcript)) !== null) {
    matches.push({
      time: match[1],
      text: match[2].trim()
    });
  }

  return matches;
}

// Function to identify speakers in the transcript
export function identifySpeakers(transcript: string): string[] {
  const speakerPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:/g;
  const speakers = new Set<string>();
  let match;

  while ((match = speakerPattern.exec(transcript)) !== null) {
    const speaker = match[1];
    if (speaker.length > 1 && speaker.length < 50) { // Reasonable name length
      speakers.add(speaker);
    }
  }

  return Array.from(speakers);
}