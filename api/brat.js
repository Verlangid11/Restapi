module.exports = {
  name: "Brat",
  desc: "Brat text generator",
  category: "Imagecreator",
  path: "/imagecreator/bratv?apikey=&text=",
  async run(req, res) {
    const { apikey, text } = req.query;
    if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
    if (!text) return res.json({ status: false, error: 'Missing text' });

    const buffer = await getBuffer(`https://fastrestapis.fasturl.cloud/maker/brat/animated?text=${encodeURIComponent(text)}&mode=image`);
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}