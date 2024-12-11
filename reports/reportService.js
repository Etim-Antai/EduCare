const fs = require('fs');
const path = require('path');
const attendanceModel = require('../models/attendanceModel'); // Adjust to the correct path

class ReportService {
    async generateAttendanceReport() {
        const attendanceRecords = await attendanceModel.getAttendance(); // Fetch all attendance records

        const csvData = this.convertToCSV(attendanceRecords);

        // Specify the path for the reports directory
        const reportsDir = path.join(__dirname, '../reports'); // Correctly point to the reports directory
        
        // Ensure the reports directory exists
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        // Specify the filename and path
        const filePath = path.join(reportsDir, `attendance_report_${Date.now()}.csv`);

        // Write the CSV data to a file
        fs.writeFileSync(filePath, csvData);

        return filePath; // Return the file path where the report is saved
    }

    convertToCSV(jsonData) {
        const header = Object.keys(jsonData[0]).join(',') + '\n';
        const rows = jsonData.map(obj => Object.values(obj).join(',')).join('\n');
        return header + rows;
    }
}

module.exports = new ReportService();
