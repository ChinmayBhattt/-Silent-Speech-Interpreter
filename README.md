# AI-Based Silent Speech Interpreter UI

A modern, responsive, and accessible frontend UI for a Silent Speech Interpreter designed for mute individuals. This application uses AI to interpret lip movements and facial expressions, converting them into text and audio.

## Features

- **Real-time Lip Reading**: Captures lip movements through the camera feed and interprets them as text.
- **Speech Synthesis**: Converts interpreted text into spoken audio.
- **Facial Expression Recognition**: Provides feedback on lip movement, face detection, and contextual understanding.
- **Accessible Design**: Includes high contrast mode, responsive layout, and text-to-speech features.
- **Interactive Tutorial**: Step-by-step guide on how to use the application.
- **Theme Options**: Light, dark, and high contrast themes for various user preferences.
- **Camera Settings**: Ability to select different cameras and adjust video resolution.

## Technologies Used

- **HTML5**: For the structure and semantic markup.
- **CSS3**: Modern styling with CSS variables, flexbox, grid, and animations.
- **JavaScript**: For interactive features and accessing device cameras.
- **Web Speech API**: For text-to-speech functionality.
- **MediaDevices API**: For accessing device cameras.

## Demo Mode

The current implementation includes a demo mode that simulates the lip-reading process without actual AI integration. This demonstrates the user interface functionality and interactions.

## Project Structure

- **index.html**: Main HTML structure.
- **style.css**: All styles and animations.
- **assets/js/main.js**: JavaScript functionality.
- **assets/images/**: SVG illustrations for the UI.

## How to Use

1. Clone or download this repository.
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge recommended).
3. Click "Start Interpreter" to begin the camera feed.
4. Position your face clearly in view of the camera.
5. Begin articulating words silently with your lips.
6. The interpreted text will appear in the output box.
7. Click "Play Speech" to hear the interpreted text spoken aloud.

## Browser Compatibility

This application requires modern browser features:
- Camera access via `navigator.mediaDevices.getUserMedia`
- Web Speech API for speech synthesis
- ES6+ JavaScript features

Best experienced in the latest versions of:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari (14+)

## Future Integration

This frontend UI is designed to be integrated with a backend AI system that performs:
- Lip movement tracking
- Facial expression recognition
- Speech prediction based on visual cues
- Natural language processing for context understanding

## License

This project is available under the MIT License.

## Credits

- Icons from [Font Awesome](https://fontawesome.com/)
- SVG illustrations created specifically for this project# -Silent-Speech-Interpreter
