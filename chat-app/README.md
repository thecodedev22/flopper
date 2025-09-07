Flopper
A decentralized, peer-to-peer chat application built with modern web technologies. Flopper enables secure, real-time messaging without relying on centralized servers.

Features
Decentralized Architecture: No central server required - messages flow directly between peers
Real-time Messaging: Instant message delivery using Gun.js peer-to-peer database
Privacy Focused: Your conversations stay between you and your peers
Offline Capable: Messages sync when peers come back online
Lightweight: Built with Svelte for optimal performance
Cross-platform: Runs in any modern web browser
Quick Start
Prerequisites
Node.js 16 or higher
npm or yarn package manager
Installation
Clone the repository:
git clone https://github.com/thecodedev22/flopper.git
cd flopper
Install dependencies:
npm install
Start the development server:
npm run dev
Open your browser and navigate to http://localhost:5173
Production Build
npm run build
npm run preview
Tech Stack
Frontend Framework: Svelte - Reactive UI framework
Build Tool: Vite - Fast build tool and dev server
P2P Database: Gun.js - Decentralized database and sync protocol
Styling: CSS with modern features
How It Works
Flopper leverages Gun.js's peer-to-peer protocol to create a truly decentralized chat experience:

Peer Discovery: When you join a chat room, Gun.js helps discover other peers
Message Propagation: Messages are distributed across the peer network
Conflict Resolution: Gun.js handles message ordering and conflict resolution
Data Persistence: Messages are stored locally and synced with peers
Architecture Overview
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Peer A   │◄──►│    Peer B   │◄──►│    Peer C   │
│  (Browser)  │    │  (Browser)  │    │  (Browser)  │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                  ▲                  ▲
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                   ┌─────────────┐
                   │   Gun.js    │
                   │  P2P Layer  │
                   └─────────────┘
Usage
Joining a Chat Room
Enter your username
Join an existing room or create a new one
Start messaging with other peers in the room
Creating Rooms
Room names are used as identifiers in the Gun.js network. Anyone with the same room name will be connected to the same chat session.

Message Features
Text Messages: Send and receive text messages in real-time
Timestamps: All messages include timestamps
User Identification: Messages show the sender's username
Message History: Previous messages are loaded when joining a room
🔧 Configuration
Environment Variables
Create a .env file in the root directory:

# Gun.js relay servers (optional)
VITE_GUN_PEERS=["https://gun-manhattan.herokuapp.com/gun"]

# App configuration
VITE_APP_NAME=Flopper
VITE_MAX_MESSAGE_LENGTH=500
Customizing Gun.js Peers
You can configure which Gun.js relay servers to use by modifying the Gun initialization in your code:

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
🛠 Development
Project Structure
flopper/
├── src/
│   ├── components/          # Svelte components
│   │   ├── Chat.svelte
│   │   ├── MessageList.svelte
│   │   └── UserInput.svelte
│   ├── stores/              # Svelte stores for state management
│   │   └── chat.js
│   ├── utils/               # Utility functions
│   │   └── gun.js
│   ├── App.svelte           # Main app component
│   └── main.js              # Entry point
├── public/                  # Static assets
├── package.json
└── vite.config.js          # Vite configuration
Available Scripts
npm run dev - Start development server
npm run build - Build for production
npm run preview - Preview production build
npm run lint - Run ESLint
npm run format - Format code with Prettier
Adding New Features
Create new Svelte components in src/components/
Add state management in src/stores/
Update Gun.js integration in src/utils/gun.js
Test with multiple browser tabs/devices
Security & Privacy
Data Privacy
Messages are stored locally in your browser
No centralized server logs your conversations
Data is encrypted during transmission between peers
Security Considerations
Gun.js uses cryptographic signatures for data integrity
Consider implementing end-to-end encryption for sensitive communications
Room names are public identifiers - choose them carefully
Deployment
Static Hosting
Flopper is a client-side application that can be deployed on any static hosting service:

Netlify
npm run build
# Deploy the 'dist' folder to Netlify
Vercel
npm run build
vercel --prod
GitHub Pages
npm run build
# Push the 'dist' folder to your gh-pages branch
Self-hosting Gun.js Relay
For better control, you can run your own Gun.js relay server:

npm install gun
node -e "var Gun = require('gun'); Gun({port: 8080, web: __dirname + '/node_modules/gun'})"
Contributing
We welcome contributions! Please follow these steps:

Fork the repository
Create a feature branch: git checkout -b feature-name
Make your changes and test thoroughly
Commit your changes: git commit -m 'Add some feature'
Push to the branch: git push origin feature-name
Submit a pull request
Development Guidelines
Follow Svelte best practices
Use meaningful commit messages
Test with multiple peers before submitting
Update documentation for new features
Troubleshooting
Common Issues
Messages not syncing between peers:

Check your internet connection
Verify Gun.js relay servers are accessible
Try refreshing the page
Poor performance with many messages:

Gun.js automatically handles large datasets
Consider implementing message pagination for very active rooms
Connection issues:

Some corporate firewalls may block Gun.js connections
Try using different relay servers
Check browser console for error messages
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Gun.js for the amazing peer-to-peer database
Svelte for the reactive framework
Vite for the lightning-fast build tool
The decentralized web community for inspiration
