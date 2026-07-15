const bannedWords = [
    "idiot",
    "stupid",
    "hate",
    "spam"
    //can add more banned words here in the future
];

function checkContent(text) {

    const content = text.toLowerCase();

    // Check banned words
    for (const word of bannedWords) {

        if (content.includes(word)) {

            return {
                allowed: false,
                reason: `Content contains banned word: "${word}"`
            };

        }

    }

    // Check for common spam phrases
    const spamPhrases = [
        "buy now",
        "click here",
        "free money",
        "limited offer"
    ];

    for (const phrase of spamPhrases) {

        if (content.includes(phrase)) {

            return {
                allowed: false,
                reason: `Spam phrase detected: "${phrase}"`
            };

        }

    }

    // Check for too many links
    const links = content.match(/https?:\/\/\S+/g);

    if (links && links.length >= 3) {

        return {
            allowed: false,
            reason: "Too many links detected."
        };

    }

    // Check for excessive repeated characters
    if (/(.)\1{7,}/.test(content)) {

        return {
            allowed: false,
            reason: "Excessive repeated characters detected."
        };

    }

    return {
        allowed: true,
        reason: "Content is acceptable."
    };

}

module.exports = {
    checkContent
};