import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Base de connaissances du chatbot
  const knowledgeBase = {
    // Questions sur la création de club
    'créer club': {
      response: "Pour créer un club, cliquez sur 'Créer un club' dans le menu ou allez sur la page de création. Vous devrez remplir le nom, la description, choisir les plateformes et définir l'effectif maximum.",
      action: () => <Link to="/create-club" className="btn btn-primary btn-sm">Créer un club</Link>
    },
    'comment créer': {
      response: "Pour créer un club, allez dans le menu et cliquez sur 'Créer un club'. Vous pourrez alors configurer votre club avec toutes les informations nécessaires.",
      action: () => <Link to="/create-club" className="btn btn-primary btn-sm">Créer un club</Link>
    },

    // Questions sur rejoindre un club
    'rejoindre club': {
      response: "Pour rejoindre un club, allez sur la page 'Clubs' et parcourez la liste. Cliquez sur un club qui vous intéresse et utilisez le bouton 'Demander à rejoindre'.",
      action: () => <Link to="/clubs" className="btn btn-primary btn-sm">Voir les clubs</Link>
    },
    'comment rejoindre': {
      response: "Pour rejoindre un club, naviguez vers la section 'Clubs' et trouvez un club qui vous plaît. Cliquez sur son profil et demandez à rejoindre.",
      action: () => <Link to="/clubs" className="btn btn-primary btn-sm">Voir les clubs</Link>
    },

    // Questions sur inviter des joueurs
    'inviter joueur': {
      response: "Pour inviter un joueur, vous devez être admin d'un club. Allez sur le profil du joueur que vous voulez inviter et cliquez sur 'Inviter dans mon club'.",
      action: null
    },
    'comment inviter': {
      response: "Pour inviter un joueur, vous devez être admin d'un club. Visitez le profil du joueur et utilisez le bouton d'invitation.",
      action: null
    },

    // Questions sur le profil
    'modifier profil': {
      response: "Pour modifier votre profil, allez sur votre page de profil et cliquez sur 'Modifier mon profil'. Vous pourrez changer vos informations personnelles et de joueur.",
      action: () => <Link to="/mon-profil" className="btn btn-primary btn-sm">Mon profil</Link>
    },
    'profil joueur': {
      response: "Votre profil joueur contient vos informations personnelles, statistiques et préférences. Vous pouvez le modifier depuis la page 'Mon profil'.",
      action: () => <Link to="/mon-profil" className="btn btn-primary btn-sm">Mon profil</Link>
    },

    // Questions sur les notifications
    'notifications': {
      response: "Les notifications vous informent des demandes d'adhésion, invitations et autres événements importants. Vous pouvez les consulter dans le menu 'Notifications'.",
      action: () => <Link to="/notifications" className="btn btn-primary btn-sm">Mes notifications</Link>
    },

    // Questions sur les clubs
    'mes clubs': {
      response: "Pour voir vos clubs, allez dans le menu et cliquez sur 'Mes clubs'. Vous verrez tous les clubs dont vous êtes membre avec votre rôle dans chacun.",
      action: () => <Link to="/mes-clubs" className="btn btn-primary btn-sm">Mes clubs</Link>
    },

    // Questions sur la recherche
    'rechercher joueur': {
      response: "Pour rechercher des joueurs, utilisez la fonction de recherche dans le menu. Vous pouvez filtrer par position, plateforme et autres critères.",
      action: () => <Link to="/recherche-joueur" className="btn btn-primary btn-sm">Rechercher des joueurs</Link>
    },
    'trouver joueur': {
      response: "Pour trouver des joueurs, allez dans la section 'Recherche de joueurs' et utilisez les filtres pour affiner votre recherche.",
      action: () => <Link to="/recherche-joueur" className="btn btn-primary btn-sm">Rechercher des joueurs</Link>
    },

    // Questions sur les rôles
    'rôle admin': {
      response: "En tant qu'admin d'un club, vous pouvez inviter des joueurs, gérer les demandes d'adhésion, modifier les informations du club et exclure des membres.",
      action: null
    },
    'admin club': {
      response: "Les admins de club ont des privilèges spéciaux : inviter des joueurs, gérer les demandes, modifier le club et exclure des membres.",
      action: null
    },

    // Questions sur les demandes
    'demande adhésion': {
      response: "Quand vous demandez à rejoindre un club, votre demande est envoyée aux admins du club. Ils peuvent l'accepter ou la refuser.",
      action: null
    },
    'accepter demande': {
      response: "Pour accepter une demande d'adhésion, allez dans vos clubs, puis dans la section 'Demandes en attente' et cliquez sur 'Accepter'.",
      action: null
    },

    // Questions générales
    'aide': {
      response: "Je peux vous aider avec la création de clubs, l'invitation de joueurs, la modification de profil et bien plus encore. Posez-moi votre question !",
      action: null
    },
    'bonjour': {
      response: "Bonjour ! Je suis votre assistant Club Pro. Comment puis-je vous aider aujourd'hui ?",
      action: null
    },
    'salut': {
      response: "Salut ! Je suis là pour vous aider avec Club Pro. Que souhaitez-vous savoir ?",
      action: null
    },
    'merci': {
      response: "De rien ! N'hésitez pas à me recontacter si vous avez d'autres questions. Bon jeu !",
      action: null
    }
  };

  // Fonction pour trouver la meilleure réponse
  const findResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerInput.includes(key)) {
        return value;
      }
    }
    
    return {
      response: "Désolé, je ne comprends pas votre question. Essayez de reformuler ou posez-moi une question sur la création de clubs, l'invitation de joueurs, ou la modification de profil.",
      action: null
    };
  };

  // Fonction pour envoyer un message
  const sendMessage = (message) => {
    if (!message.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simuler le délai de réponse du bot
    setTimeout(() => {
      const botResponse = findResponse(message);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.response,
        sender: 'bot',
        timestamp: new Date(),
        action: botResponse.action
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Fonction pour gérer la soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Fonction pour les suggestions rapides
  const handleQuickReply = (suggestion) => {
    sendMessage(suggestion);
  };

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen]);

  // Message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: "Bonjour ! Je suis votre assistant Club Pro. Comment puis-je vous aider ?",
        sender: 'bot',
        timestamp: new Date(),
        action: null
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const suggestions = [
    "Comment créer un club ?",
    "Comment rejoindre un club ?",
    "Comment inviter un joueur ?",
    "Comment modifier mon profil ?",
    "Comment rechercher des joueurs ?",
    "Quels sont mes droits d'admin ?"
  ];

  return (
    <>
      {/* Bouton flottant du chatbot */}
      <div 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          fontSize: '24px'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
        }}
      >
        {isOpen ? '✕' : '💬'}
      </div>

      {/* Interface du chatbot */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <i className="fas fa-robot me-2"></i>
              Assistant Club Pro
            </div>
            <button 
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`chatbot-message ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  {message.action && (
                    <div className="message-action">
                      {message.action}
                    </div>
                  )}
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chatbot-message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions rapides */}
          {messages.length === 1 && (
            <div className="chatbot-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleQuickReply(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping || !inputValue.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 999;
          animation: slideInUp 0.3s ease-out;
          overflow: hidden;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 20px 20px 0 0;
        }

        .chatbot-title {
          font-weight: 600;
          font-size: 16px;
        }

        .chatbot-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .chatbot-close:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .chatbot-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .chatbot-message {
          display: flex;
          margin-bottom: 10px;
        }

        .chatbot-message.user {
          justify-content: flex-end;
        }

        .chatbot-message.bot {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
        }

        .chatbot-message.user .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 6px;
        }

        .chatbot-message.bot .message-content {
          background: #f8f9fa;
          color: #333;
          border-bottom-left-radius: 6px;
        }

        .message-text {
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .message-action {
          margin-top: 10px;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 5px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .chatbot-suggestions {
          padding: 15px 20px;
          border-top: 1px solid #e9ecef;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .suggestion-btn {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          color: #667eea;
        }

        .suggestion-btn:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .chatbot-input {
          padding: 20px;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 10px;
        }

        .chatbot-input input {
          flex: 1;
          border: 1px solid #e9ecef;
          border-radius: 25px;
          padding: 12px 20px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chatbot-input input:focus {
          border-color: #667eea;
        }

        .chatbot-input button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chatbot-input button:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .chatbot-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .chatbot-container {
            width: calc(100vw - 40px);
            height: 60vh;
            bottom: 80px;
            right: 20px;
            left: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot; 