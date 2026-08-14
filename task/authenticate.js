const authenticate = async (sessionId) => {
    try {
        if (typeof sessionId !== "string" || sessionId.trim().length === 0) {
            return {
                valid: false,
                message: "Please login first."
            };
        }

        const response = await fetch(`${process.env.AUTH_SERVICE_URL}/validate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": sessionId
            }
        });

        if (!response.ok) {
            return {
                valid: false,
                message: "User is not authenticated."
            };
        }

        const data = await response.json();

        return {
            valid: true,
            userId: data.user_Id
        };

    } catch (err) {
        console.error("Authentication request failed:", err);

        return {
            valid: false,
            message: "Authentication service is unavailable."
        };
    }
};

module.exports = authenticate;
