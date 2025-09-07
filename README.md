# Flopper 

A decentralized, peer-to-peer chat application built with modern web technologies. Flopper enables secure, real-time messaging without relying on centralized servers.

##  Features

- **Decentralized Architecture**: No central server required - messages flow directly between peers
- **Real-time Messaging**: Instant message delivery using Gun.js peer-to-peer database
- **Privacy Focused**: Your conversations stay between you and your peers
- **Offline Capable**: Messages sync when peers come back online
- **Lightweight**: Built with Svelte for optimal performance
- **Cross-platform**: Runs in any modern web browser

##  Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thecodedev22/flopper.git
cd flopper
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

##  Tech Stack

- **Frontend Framework**: [Svelte](https://svelte.dev/) - Reactive UI framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool and dev server
- **P2P Database**: [Gun.js](https://gun.eco/) - Decentralized database and sync protocol
- **Styling**: CSS with modern features

## 📖 How It Works

Flopper leverages Gun.js's peer-to-peer protocol to create a truly decentralized chat experience:

1. **Peer Discovery**: When you join a chat room, Gun.js helps discover other peers
2. **Message Propagation**: Messages are distributed across the peer network
3. **Conflict Resolution**: Gun.js handles message ordering and conflict resolution
4. **Data Persistence**: Messages are stored locally and synced with peers

### Architecture Overview

```
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
```

##  Usage

### Joining a Chat Room

1. Enter your username
2. Join an existing room or create a new one
3. Start messaging with other peers in the room

### Creating Rooms

Room names are used as identifiers in the Gun.js network. Anyone with the same room name will be connected to the same chat session.

### Message Features

- **Text Messages**: Send and receive text messages in real-time
- **Timestamps**: All messages include timestamps
- **User Identification**: Messages show the sender's username
- **Message History**: Previous messages are loaded when joining a room

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Gun.js relay servers (optional)
VITE_GUN_PEERS=["https://gun-manhattan.herokuapp.com/gun"]

# App configuration
VITE_APP_NAME=Flopper
VITE_MAX_MESSAGE_LENGTH=500
```

### Customizing Gun.js Peers

You can configure which Gun.js relay servers to use by modifying the Gun initialization in your code:

```javascript
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
```

## 🛠 Development

### Project Structure

```
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
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Adding New Features

1. Create new Svelte components in `src/components/`
2. Add state management in `src/stores/`
3. Update Gun.js integration in `src/utils/gun.js`
4. Test with multiple browser tabs/devices

##  Security & Privacy

### Data Privacy
- Messages are stored locally in your browser
- No centralized server logs your conversations
- Data is encrypted during transmission between peers

### Security Considerations
- Gun.js uses cryptographic signatures for data integrity
- Consider implementing end-to-end encryption for sensitive communications
- Room names are public identifiers - choose them carefully

## Deployment

### Static Hosting

Flopper is a client-side application that can be deployed on any static hosting service:

#### Netlify
```bash
npm run build
# Deploy the 'dist' folder to Netlify
```

#### Vercel
```bash
npm run build
vercel --prod
```

#### GitHub Pages
```bash
npm run build
# Push the 'dist' folder to your gh-pages branch
```

### Self-hosting Gun.js Relay

For better control, you can run your own Gun.js relay server:

```bash
npm install gun
node -e "var Gun = require('gun'); Gun({port: 8080, web: __dirname + '/node_modules/gun'})"
```

##  Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

### Development Guidelines

- Follow Svelte best practices
- Use meaningful commit messages
- Test with multiple peers before submitting
- Update documentation for new features

## Troubleshooting

### Common Issues

**Messages not syncing between peers:**
- Check your internet connection
- Verify Gun.js relay servers are accessible
- Try refreshing the page

**Poor performance with many messages:**
- Gun.js automatically handles large datasets
- Consider implementing message pagination for very active rooms

**Connection issues:**
- Some corporate firewalls may block Gun.js connections
- Try using different relay servers
- Check browser console for error messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Gun.js](https://gun.eco/) for the amazing peer-to-peer database
- [Svelte](https://svelte.dev/) for the reactive framework
- [Vite](https://vitejs.dev/) for the lightning-fast build tool
- The decentralized web community for inspiration



---

**Built with ❤️ for the decentralized web**
