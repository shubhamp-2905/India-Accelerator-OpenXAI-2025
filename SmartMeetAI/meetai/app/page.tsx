'use client';

import React, { useState, useRef } from 'react';
import { Upload, Mic, MicOff, FileText, Download, Clock, Users, Target } from 'lucide-react';

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

export default function MeetingMinutesSummarizer() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('unknown');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/summarize');
      const data = await response.json();
      setApiStatus(data.ollama === 'connected' && data.tinyllama === 'ready' ? 'connected' : 'disconnected');
      console.log('API Status:', data);
      alert(`API Status: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setApiStatus('error');
      console.error('API test failed:', error);
      alert(`API test failed: ${error}`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // In a real app, you'd process the audio file here
      setTranscript('Sample transcript from uploaded audio file...');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setTranscript('Sample live transcript: The meeting started at 9 AM. We discussed the quarterly goals and project timelines. John will handle the marketing campaign, due by Friday. Sarah will coordinate with the development team...');
      }, 2000);
    }
  };

  const processMeetingMinutes = async () => {
    setIsProcessing(true);
    try {
      console.log('Sending transcript to API...', transcript.substring(0, 100) + '...');
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const summaryData = await response.json();
        console.log('Summary data received:', summaryData);
        setSummary(summaryData);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        alert(`Failed to process meeting minutes: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing meeting minutes:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportSummary = () => {
    if (!summary) return;
    
    const content = `
MEETING SUMMARY
===============

Title: ${summary.title}
Date: ${summary.date}
Duration: ${summary.duration}
Participants: ${summary.participants.join(', ')}

KEY POINTS:
${summary.keyPoints.map(point => `• ${point}`).join('\n')}

DECISIONS MADE:
${summary.decisions.map(decision => `• ${decision}`).join('\n')}

ACTION ITEMS:
${summary.actionItems.map(item => `• ${item.task} (Assigned to: ${item.assignee}, Due: ${item.deadline}, Priority: ${item.priority})`).join('\n')}

NEXT STEPS:
${summary.nextSteps.map(step => `• ${step}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meeting Minutes Summarizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your meeting recordings into structured summaries with AI-powered
            speech-to-text and intelligent action item extraction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Mic className="mr-2 text-blue-600" />
              Input Meeting Audio
            </h2>

            {/* API Status Check */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  API Connection Status
                </label>
                <button
                  onClick={testApiConnection}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Test Connection
                </button>
              </div>
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                apiStatus === 'connected' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : apiStatus === 'disconnected'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : apiStatus === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {apiStatus === 'connected' && '✓ TinyLlama Ready'}
                {apiStatus === 'disconnected' && '⚠ TinyLlama Not Available (using mock data)'}
                {apiStatus === 'error' && '✗ API Connection Error'}
                {apiStatus === 'unknown' && 'Unknown - Click "Test Connection"'}
              </div>
            </div>

            {/* Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Audio File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your audio file here, or
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse files
                </button>
                {uploadedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {uploadedFile.name} uploaded
                  </p>
                )}
              </div>
            </div>

            {/* Live Recording Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Recording
              </label>
              <button
                onClick={toggleRecording}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2" />
                    Start Recording
                  </>
                )}
              </button>
              {isRecording && (
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center text-red-600 text-sm">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
                    Recording in progress...
                  </span>
                </div>
              )}
            </div>

            {/* Transcript Section */}
            {transcript && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcript
                </label>
                <div className="bg-gray-50 border rounded-lg p-4 h-40 overflow-y-auto">
                  <p className="text-sm text-gray-800">{transcript}</p>
                </div>
              </div>
            )}

            {/* Process Button */}
            {transcript && (
              <button
                onClick={processMeetingMinutes}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2" />
                    Generate Summary
                  </>
                )}
              </button>
            )}
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <FileText className="mr-2 text-green-600" />
                Meeting Summary
              </h2>
              {summary && (
                <button
                  onClick={exportSummary}
                  className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </button>
              )}
            </div>

            {!summary ? (
              <div className="text-center text-gray-500 py-12">
                <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p>Upload audio or start recording to generate a summary</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Meeting Info */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">{summary.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {summary.date} ({summary.duration})
                    </span>
                    <span className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {summary.participants.length} participants
                    </span>
                  </div>
                </div>

                {/* Key Points */}
                <div>
                  <h4 className="font-semibold mb-2">Key Discussion Points</h4>
                  <ul className="space-y-1">
                    {summary.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decisions */}
                <div>
                  <h4 className="font-semibold mb-2">Decisions Made</h4>
                  <ul className="space-y-1">
                    {summary.decisions.map((decision, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {decision}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Target className="mr-2 h-4 w-4" />
                    Action Items
                  </h4>
                  <div className="space-y-3">
                    {summary.actionItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">{item.task}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Assigned to: {item.assignee}</span>
                          <span>Due: {item.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h4 className="font-semibold mb-2">Next Steps</h4>
                  <ul className="space-y-1">
                    {summary.nextSteps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}