export async function POST(req) {
    try {
        const body = await req.json();

        const response = await fetch("https://www.bing.com/indexnow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                host: "www.multigyan.in",
                key: "a35e63d2f4364509b75ae713a291e9e6",
                keyLocation: "https://www.multigyan.in/a35e63d2f4364509b75ae713a291e9e6.txt",
                urlList: [body.url],
            }),
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false }, { status: 500 });
    }
}
