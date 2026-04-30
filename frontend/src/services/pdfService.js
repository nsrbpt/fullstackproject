import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

export const generateHallReport = (hallsData, examId) => {
  const doc = new jsPDF();
  
  // Aggregate seats by hall
  const grouped = Object.groupBy ? Object.groupBy(hallsData, (a) => a.hallId.name) : {};
  if(!Object.groupBy) {
    hallsData.forEach(a => {
      grouped[a.hallId.name] = grouped[a.hallId.name] || [];
      grouped[a.hallId.name].push(a);
    });
  }

  for (const [hallName, allocations] of Object.entries(grouped)) {
    doc.addPage();
    doc.setFontSize(22);
    doc.text(`Hall: ${hallName}`, 14, 20);
    doc.setFontSize(14);
    doc.text(`Exam ID: ${examId}`, 14, 30);
    doc.text(`Total Students: ${allocations.length}`, 14, 40);

    const tableData = allocations.map(a => [
      a.seatNumber,
      a.studentId.rollNumber,
      a.studentId.name,
      a.studentId.department
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Seat', 'Roll Number', 'Name', 'Department']],
      body: tableData,
    });
  }

  // Delete the empty initial page
  doc.deletePage(1);
  doc.save(`Seating_Allocation_${examId}.pdf`);
};

export const generateDoorSignage = (hallsData, examId) => {
  const doc = new jsPDF('landscape');
  
  const grouped = {};
  hallsData.forEach(a => {
    grouped[a.hallId.name] = grouped[a.hallId.name] || [];
    grouped[a.hallId.name].push(a);
  });

  for (const [hallName, allocations] of Object.entries(grouped)) {
    doc.addPage();
    doc.setFontSize(60);
    doc.text(hallName, doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });
    
    doc.setFontSize(30);
    doc.text(`Exam ID: ${examId}`, doc.internal.pageSize.getWidth() / 2, 120, { align: 'center' });
    doc.text(`Total Occupants: ${allocations.length}`, doc.internal.pageSize.getWidth() / 2, 140, { align: 'center' });
  }

  doc.deletePage(1);
  doc.save(`Door_Signage_${examId}.pdf`);
};

export const generateStudentSlips = async (allocations, examId) => {
  const doc = new jsPDF();
  let y = 20;

  for (const a of allocations) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const qrPayload = JSON.stringify({
      examId,
      studentId: a.studentId._id,
      roll: a.studentId.rollNumber,
      hall: a.hallId.name,
      seat: a.seatNumber
    });
    
    const qrCodeUrl = await QRCode.toDataURL(qrPayload);

    doc.rect(10, y - 5, 190, 40);
    doc.setFontSize(14);
    doc.text(`Exam ID: ${examId} | Hall: ${a.hallId.name} | Seat: ${a.seatNumber}`, 15, y + 5);
    doc.setFontSize(12);
    doc.text(`Name: ${a.studentId.name} (${a.studentId.rollNumber})`, 15, y + 15);
    doc.text(`Department: ${a.studentId.department}`, 15, y + 25);
<<<<<<< HEAD
    doc.addImage(a.qrCodeUrl, 'PNG', 160, y, 30, 30);
=======
    doc.addImage(qrCodeUrl, 'PNG', 160, y, 30, 30);
>>>>>>> df960e8 (Optimize system: database integrity, performance improvements, and UI/UX enhancements)
    
    y += 50;
  }

  doc.save(`Student_Slips_${examId}.pdf`);
};
