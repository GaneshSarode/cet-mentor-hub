const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    try {
        const url = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-23rd-april-morning-shift/mf3ics04';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const nextDataStr = $('#__NEXT_DATA__').html();
        if (nextDataStr) {
            const nextData = JSON.parse(nextDataStr);
            console.log(JSON.stringify(nextData.props.pageProps, null, 2));
        } else {
            console.log('No __NEXT_DATA__ found');
        }
    } catch (e) {
        console.error(e);
    }
}
test();
