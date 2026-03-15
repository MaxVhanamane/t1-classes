export async function sendTelegramMessage(message: string, phone: string) {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_GROUP_ID;

        if (!token || !chatId) {
            console.error("Telegram env missing");
            return;
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "💬 WhatsApp",
                                url: `https://wa.me/${phone}`,
                            }
                        ]
                    ],
                },
            }),
        });
    } catch (err) {
        console.error("Telegram send error:", err);
    }
}
