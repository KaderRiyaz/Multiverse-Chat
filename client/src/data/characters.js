// Public display data only. Persona system instructions stay on the server.
export const characters = [
  {
    id: "captain-america",
    name: "Captain America",
    universe: "Marvel",
    themeColor: "#3B82F6",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/27/Chris_Evans_as_Steve_Rogers_aka_Captain_America_%2834407349161%29.jpg",
    greetingMessage: "Hey. Take a seat. What's on your mind?",
    starterPrompts: [
      "What makes someone a good leader?",
      "Tell me about your time in the Avengers.",
      "How do you keep going when things get difficult?"
    ]
  },
  {
    id: "iron-man",
    name: "Iron Man",
    universe: "Marvel",
    themeColor: "#F97316",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3c/2015_Boston_Comic_Con_Cosplay_of_Iron_Man.jpg",
    greetingMessage: "Welcome to the lab. What have you got?",
    starterPrompts: [
      "What was your biggest mistake?",
      "Explain the arc reactor.",
      "What makes a great inventor?"
    ]
  },
  {
    id: "thor",
    name: "Thor",
    universe: "Marvel",
    themeColor: "#A78BFA",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/NYCC_2023_Cosplay_of_Thor.jpg",
    greetingMessage: "Greetings, friend! What shall we discuss?",
    starterPrompts: [
      "Tell me about Asgard.",
      "What has loss taught you?",
      "What is true courage?"
    ]
  },
  {
    id: "batman",
    name: "Batman",
    universe: "DC",
    themeColor: "#94A3B8",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/88/Batman_cosplay_at_Pittsburgh_Comicon.jpg",
    greetingMessage: "You're in Gotham. What do you need to figure out?",
    starterPrompts: [
      "How do you stay one step ahead?",
      "Tell me about Alfred.",
      "How do you handle fear?"
    ]
  },
  {
    id: "wonder-woman",
    name: "Wonder Woman",
    universe: "DC",
    themeColor: "#E879A9",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Wonder_Woman_cosplay_%2851983876217%29.jpg",
    greetingMessage: "Welcome, friend. What would you like to explore?",
    starterPrompts: [
      "What does true strength mean?",
      "Tell me about Themyscira.",
      "How can compassion coexist with justice?"
    ]
  },
  {
    id: "superman",
    name: "Superman",
    universe: "DC",
    themeColor: "#38BDF8",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/Superman_cosplay_by_Greg_Carlson.jpg",
    greetingMessage: "Hi! What's on your mind?",
    starterPrompts: [
      "What does hope mean to you?",
      "How do you balance Clark Kent and Superman?",
      "What did your parents teach you?"
    ]
  },
  {
    id: "spider-man",
    name: "Spider-Man",
    universe: "Marvel",
    bio: "A quick-witted web-slinger balancing neighborhood heroics with everyday responsibility.",
    themeColor: "#EF4444",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/be/Spider-Man_cosplay.jpg",
    greetingMessage: "Hey! Friendly neighborhood Spider-Man here. What's up?",
    starterPrompts: ["How do you balance responsibility and normal life?", "Tell me about New York.", "What keeps you hopeful?"]
  },
  {
    id: "black-panther",
    name: "Black Panther",
    universe: "Marvel",
    bio: "T'Challa, protector of Wakanda, combining kingly duty, science, and warrior discipline.",
    themeColor: "#8B5CF6",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Black_Panther_cosplay_-_2018_Atlanta_Comic_Con.jpg",
    greetingMessage: "Wakanda welcomes you. What would you learn or discuss?",
    starterPrompts: ["What does leadership require?", "Tell me about Wakanda.", "How do tradition and innovation coexist?"]
  },
  {
    id: "the-flash",
    name: "The Flash",
    universe: "DC",
    bio: "Barry Allen, a forensic scientist and speedster who protects Central City and the timeline.",
    themeColor: "#F59E0B",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Montreal_Comiccon_2016_-_The_Flash_%2827643901323%29.jpg",
    greetingMessage: "Hey! Barry Allen here. We've got time for one question—probably. What's on your mind?",
    starterPrompts: ["How do you experience time?", "Tell me about Central City.", "What makes a hero keep moving?"]
  },
  {
    id: "green-lantern",
    name: "Green Lantern",
    universe: "DC",
    bio: "Hal Jordan, a fearless test pilot chosen to wield a power ring through willpower and courage.",
    themeColor: "#22C55E",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/C2E2%202013%20-%20Green%20Lantern%20(8702697896).jpg?width=512",
    greetingMessage: "The ring chose you for a conversation. What do you want to know?",
    starterPrompts: ["What is willpower?", "Tell me about the Corps.", "How do you face fear?"]
  }
];
