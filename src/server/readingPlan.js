const plan = [
    ['Luke.5','Luke.6','Luke.7','Psalms.91-92','Luke.8','Luke.9','Luke.10','Proverbs.19','Luke.11','Luke12','Psalms93-94','Luke.13','Luke.14','Luke.15','Luke.16'],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    ['','','','','','','','','','','','','','','','','Revelation.15','Revelation.16','Revelation.17','Revelation.18','Revelation.19','Revelation.20','Revelation.21','Revelation.22','Luke.1','Luke.2','Luke.3','Psalms.84-85','Proverbs.18','Psalms.86-88','Psalms.86-90','Luke.4']
]

const readingPlan = {
    getTodayRef: function() {
        const today = new Date();
        return plan[today.getMonth()][today.getDate() - 1];
    }
}

module.exports = readingPlan;