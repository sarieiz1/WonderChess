
import React from 'react';
import { Language } from './types';

export const COLORS = {
  light: '#A1E3F9', // Ice-Blue
  dark: '#A8E6CF',  // Meadow-Green
  primary: '#3B82F6',
  accent: '#F472B6',
};

export const PIECE_MAP: Record<string, string> = {
  'wp': '🐣', // Baby Penguin Chick
  'wn': '🐻', // Polar Bear Cub
  'wb': '🦭', // Playful Seal
  'wr': '🏠', // Cozy Igloo
  'wq': '🐧', // Penguin Queen Base
  'wk': '🐧', // Penguin King Base
  'wq_head': '🎀', // Queen's Bow
  'wk_head': '👑', // King's Crown
  'bp': '🐛', // Green Caterpillar
  'bn': '🐞', // Lucky Ladybug
  'bb': '🦉', // Wise Owl
  'br': '🍄', // Magical Mushroom
  'bq': '🐝', // Queen Bee
  'bk': '🦋', // Giant Monarch Butterfly
  'bq_head': '🎀', // Bee Queen's Ribbon
  'bk_head': '👑', // Butterfly King's Crown
};

export const TRANSLATIONS = {
  en: {
    title: "Wonderchess",
    newAdventure: "New Adventure",
    chooseKingdom: "Choose your kingdom!",
    yourName: "Your Name",
    player2Name: "Player 2 Name",
    vsComputer: "vs Computer",
    local2P: "Local 2P",
    difficulty: "AI Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    whichKingdom: "Which Kingdom?",
    penguins: "Penguins",
    butterflies: "Butterflies",
    startMagic: "START MAGIC!",
    hallOfFame: "Adventure History",
    home: "Home",
    players: "Players",
    yourTurn: "Your Turn",
    thinking: "Thinking...",
    giveHug: "HUG EVERYONE",
    needsHug: "Everyone on the board is sending you a big hug!",
    doingGreat: "Michael, you are doing great!",
    gameOver: "Game Over!",
    wonderfulPerformance: "What a wonderful performance by everyone!",
    winner: "Winner",
    playAgain: "Play Again",
    draw: "It's a Draw!",
    firstTrophy: "Your first adventure is waiting to be written!",
    friendlyCoach: "Friendly Coach",
    thinkNextMove: "Think about your next magical move!",
    snowman: "Friendly Snowman",
    computer: "Computer",
    date: "Date",
    signIn: "Sign in",
    signOut: "Sign out",
    signedInAs: "Signed in as",
  },
  he: {
    title: "שחמט הפלאות",
    newAdventure: "הרפתקה חדשה",
    chooseKingdom: "בחרו את הממלכה שלכם!",
    yourName: "השם שלך",
    player2Name: "שם שחקן 2",
    vsComputer: "נגד המחשב",
    local2P: "שני שחקנים",
    difficulty: "רמת קושי",
    easy: "קל",
    medium: "בינוני",
    hard: "קשה",
    whichKingdom: "איזו ממלכה?",
    penguins: "פינגווינים",
    butterflies: "פרפרים",
    startMagic: "התחילו בקסם!",
    hallOfFame: "היסטוריית הרפתקאות",
    home: "מסך הבית",
    players: "שחקנים",
    yourTurn: "תורך",
    thinking: "חושב...",
    giveHug: "חיבוק לכולם",
    needsHug: "כל החברים על הלוח שולחים לך חיבוק גדול!",
    doingGreat: "מיכאל, אתה מצליח נהדר!",
    gameOver: "המשחק נגמר!",
    wonderfulPerformance: "איזה ביצוע נהדר של כולם!",
    winner: "המנצח",
    playAgain: "לשחק שוב",
    draw: "זה תיקו!",
    firstTrophy: "ההרפתקה הראשונה שלך מחכה להיכתב!",
    friendlyCoach: "מאמן ידידותי",
    thinkNextMove: "חשוב על המהלך הקסום הבא שלך!",
    snowman: "איש שלג ידידותי",
    computer: "מחשב",
    date: "תאריך",
    signIn: "התחבר",
    signOut: "התנתק",
    signedInAs: "מחובר כ-",
  }
};

export const COACH_MESSAGES_I18N = {
  en: {
    capture: [
      "Don't worry! Your friend is just going for a snack. Keep going!",
      "Oops! That one's taking a little break in the garden.",
      "A quick nap for your friend! They'll be cheering from the side."
    ],
    check: [
      "Amazing move! You've got them on their toes!",
      "Look at that! You're really showing your magic!",
      "Check! You're a chess master in the making!"
    ],
    start: [
      "Let's have a magical game, Michael!",
      "Ready to explore the Frozen Kingdom and Enchanted Forest?",
      "Every move is a new adventure. Have fun!"
    ],
    victory: [
      "Wow! What a spectacular win! You're amazing!",
      "The Kingdom and Forest celebrate your victory!",
      "Great job, Michael! You played like a true hero!"
    ]
  },
  he: {
    capture: [
      "אל דאגה! החבר שלך רק יצא לנשנוש. המשך ככה!",
      "אופס! זה לוקח הפסקה קטנה בגינה.",
      "תנומה קצרה לחבר שלך! הוא יעודד מהצד."
    ],
    check: [
      "מהלך מדהים! גרמת להם להיות דרוכים!",
      "תראה את זה! אתה ממש מראה את הקסם שלך!",
      "שח! אתה אלוף שחמט בהתהוות!"
    ],
    start: [
      "בואו נשחק משחק קסום, מיכאל!",
      "מוכנים לחקור את ממלכת הקרח והיער הקסום?",
      "כל מהלך הוא הרפתקה חדשה. תהנו!"
    ],
    victory: [
      "וואו! איזה ניצחון מרהיב! אתה מדהים!",
      "הממלכה והיער חוגגים את הניצחון שלך!",
      "עבודה מצוינת, מיכאל! שיחקת כמו גיבור אמיתי!"
    ]
  }
};
