import { pdf } from '@react-pdf/renderer';
import { EnrollmentPdfDocument } from './EnrollmentPdfDocument.jsx';

export async function getEnrollmentPdfBlob(submission) {
  return pdf(<EnrollmentPdfDocument submission={submission} />).toBlob();
}

export async function openEnrollmentPdf(submission) {
  // Open the tab synchronously (still inside the click's user-gesture window)
  // so the browser doesn't block it while we build the PDF, then navigate it
  // once the blob is ready.
  const newTab = window.open('', '_blank');
  const blob = await getEnrollmentPdfBlob(submission);
  const url = URL.createObjectURL(blob);
  if (newTab) {
    newTab.location.href = url;
  } else {
    window.open(url, '_blank');
  }
  return url;
}

export async function downloadEnrollmentPdf(submission, filename = 'ifoa-enrollment-form.pdf') {
  const blob = await getEnrollmentPdfBlob(submission);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
