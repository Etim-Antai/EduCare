const cron = require('node-cron');
const reportService = require('./reports/reportService'); // Adjust the path as necessary

/// Schedule a task to run every 1 minutes
cron.schedule('0 0 * * *', async () => {
    try {
        const reportFilePath = await reportService.generateAttendanceReport();
        console.log(`Attendance report generated: ${reportFilePath}`);
    } catch (error) {
        console.error('Error generating report:', error);
    }
});
