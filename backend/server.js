const dns = require('dns');
// Render'da IPv6 yo'riqlash muammolari tufayli DNS-ni IPv4-ni birinchi o'ringa qo'yishga majburlaymiz
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const app = require('./src/app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server ${PORT}-portta juwırıp atır...`);
});