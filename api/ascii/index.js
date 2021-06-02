const imageToAscii = require("image-to-ascii");

module.exports = async function (req, res) {
    try {
        const {
            query: { url },
          } = req
        if (!url) {
            return res.status(500).send("Please send a url");
        }
        imageToAscii(url, (err, converted) => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send(converted);
        });

    } catch (e) {
        return res.status(500).send('Error converting to ascii');
    }
};