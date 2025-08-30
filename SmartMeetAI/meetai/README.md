# Meeting Minutes Summarizer

> Transform your meeting recordings into structured summaries with AI-powered speech-to-text and intelligent action item extraction.

<img width="1917" height="964" alt="image" src="https://github.com/user-attachments/assets/66f1fad1-140d-41ff-a337-12c90b5dca62" />

<img width="1920" height="965" alt="image" src="https://github.com/user-attachments/assets/858d254b-615b-4442-a53a-b892df706144" />

<img width="1895" height="1069" alt="image" src="https://github.com/user-attachments/assets/e1347726-7608-40e8-9e13-f7301eec66b4" />

## ✨ Features

- 🎤 **Live Recording** - Real-time speech recognition using Web Speech API
- 📁 **File Upload** - Support for audio files (MP3, WAV, M4A, WebM)
- 🤖 **AI Processing** - Local TinyLlama model integration via Ollama
- 📋 **Smart Extraction** - Automatically identifies key points, decisions, and action items
- 👥 **Participant Detection** - Recognizes speakers and meeting attendees
- 📊 **Priority Mapping** - Categorizes action items by priority (high/medium/low)
- 📄 **Export Options** - Download summaries as text files
- 🌐 **Modern UI** - Clean, responsive interface built with Tailwind CSS

## 🚀 Demo

### Input Methods
- **Live Recording**: Click "Start Recording" and speak directly into your microphone
- **File Upload**: Drag and drop or browse for audio files from your meetings

### AI-Generated Summary
The application automatically extracts:
- Meeting title and basic information
- Key discussion points
- Decisions made during the meeting
- Action items with assignees and deadlines
- Next steps and follow-up tasks

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Model**: TinyLlama (via Ollama)
- **Speech Recognition**: Web Speech API
- **Audio Processing**: Browser File API

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- Ollama installed and running
- TinyLlama model downloaded in Ollama

### Installing Ollama and TinyLlama

1. **Install Ollama**:
   ```bash
   # On macOS
   brew install ollama
   
   # On Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # On Windows
   # Download from https://ollama.ai/download
   ```

2. **Download TinyLlama Model**:
   ```bash
   ollama pull tinyllama:latest
   ```

3. **Start Ollama Server**:
   ```bash
   ollama serve
   ```

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/meeting-minutes-summarizer.git
   cd meeting-minutes-summarizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## 🎯 Usage

### Live Recording
1. Click the "Test Connection" button to verify Ollama is running
2. Click "Start Recording" to begin capturing audio
3. Speak clearly into your microphone
4. Click "Stop Recording" when finished
5. Click "Generate Summary" to process with AI

### File Upload
1. Click "browse files" or drag and drop an audio file
2. Wait for speech-to-text processing to complete
3. Review the generated transcript
4. Click "Generate Summary" to extract meeting insights

### Exporting Results
- Click the "Export" button to download your meeting summary as a text file
- Summaries include all key information in a structured format

## ⚙️ Configuration

### API Endpoint
The application connects to Ollama at `http://localhost:11434` by default. To change this:

1. Open `api/summarize/route.ts`
2. Modify the `OLLAMA_URL` in the `callLocalLlama` function:
   ```typescript
   const response = await fetch('http://your-ollama-host:11434/api/generate', {
     // ... rest of the configuration
   });
   ```

### Model Settings
Adjust the TinyLlama model parameters in `api/summarize/route.ts`:

```typescript
options: {
  temperature: 0.3,      // Creativity level (0-1)
  top_p: 0.9,           // Nucleus sampling
  top_k: 40,            // Top-k sampling
  num_predict: 1500,    // Max response length
}
```

## 🌐 Browser Compatibility

### Speech Recognition Support
- ✅ **Chrome** 25+ (Recommended)
- ✅ **Edge** 79+
- ✅ **Safari** 14.1+
- ❌ **Firefox** (Not supported)

### File Upload Support
- ✅ All modern browsers support file upload functionality

## 🧪 Development

### Project Structure
```
├── app/
│   ├── api/
│   │   └── summarize/
│   │       └── route.ts          # AI processing API
│   ├── components/
│   │   └── MeetingSummarizer.tsx  # Main React component
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # App layout
│   └── page.tsx                 # Home page
├── public/                      # Static assets
├── package.json                 # Dependencies
└── README.md                    # This file
```

### Key Components

**API Route** (`api/summarize/route.ts`):
- Handles transcript processing
- Integrates with Ollama/TinyLlama
- Parses AI responses into structured data
- Provides health check endpoint

**Main Component** (`components/MeetingSummarizer.tsx`):
- Speech recognition implementation
- File upload handling
- UI state management
- Summary visualization

### Adding New Features

1. **Custom Prompts**: Modify the prompt in `api/summarize/route.ts`
2. **Additional Models**: Change the model name in the Ollama API call
3. **Export Formats**: Add new export functions in the main component
4. **UI Enhancements**: Update the Tailwind classes and add new components

## 🔧 Troubleshooting

### Common Issues

**"API Connection Error"**
- Ensure Ollama is running: `ollama serve`
- Check if TinyLlama is installed: `ollama list`
- Verify the API endpoint in the code

**"Speech Recognition Not Supported"**
- Use Chrome, Edge, or Safari browser
- Enable microphone permissions
- Ensure HTTPS in production

**"No Transcript Available"**
- Check microphone permissions
- Ensure audio file is valid format
- Verify speech recognition is working

**Poor Summary Quality**
- Use clear, high-quality audio
- Speak distinctly and avoid background noise
- Try adjusting model parameters

### Debug Mode

Enable detailed logging by adding to `api/summarize/route.ts`:
```typescript
console.log('Full transcript:', transcript);
console.log('AI response:', llamaResponse);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Add proper error handling
- Include tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for local AI model serving
- [TinyLlama](https://github.com/jzhang38/TinyLlama) for the compact language model
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Next.js](https://nextjs.org/) for the React framework

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/meeting-minutes-summarizer/issues) page
2. Create a new issue if your problem isn't already addressed
3. Provide detailed information about your setup and the issue

---

**Made with ❤️ for better meeting productivity**
