document.addEventListener("DOMContentLoaded", () => {
    // Get student ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');
    
    console.log('📍 Current URL:', window.location.href);
    console.log('🆔 Student ID from URL:', studentId);

    // Fallback: Try to get from localStorage/sessionStorage
    const storedStudentId = localStorage.getItem('studentId') || sessionStorage.getItem('studentId');
    const finalStudentId = studentId || storedStudentId;
    
    console.log('💾 Stored Student ID:', storedStudentId);
    console.log('✅ Final Student ID to use:', finalStudentId);

    // ===== COMPLAINT BUTTON =====
    const complaintBtn = document.getElementById('complainButton');
    if (complaintBtn) {
        complaintBtn.addEventListener('click', () => {
            if (finalStudentId) {
                window.location.href = `complainbox.html?id=${finalStudentId}`;
            } else {
                window.location.href = "complainbox.html";
            }
        });
    }

    // ===== ACTION BUTTONS =====
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cardType = button.closest('.card')?.classList[1];
            let targetPage = '';

            switch (cardType) {
                case 'payment':   targetPage = 'CheckPayments.html';    break;
                case 'booking':   targetPage = 'GuestRoomBooking.html'; break;
                case 'meal':      targetPage = 'MealManagement.html';   break;
                case 'attend':    targetPage = 'Attendance.html';       break;
                case 'complaint': targetPage = 'complainbox.html';      break;
                case 'notices':   targetPage = 'Notices.html';          break;
                default: return;
            }

            if (finalStudentId) {
                window.location.href = `${targetPage}?id=${finalStudentId}`;
            } else {
                window.location.href = targetPage;
            }
        });
    });

    // ===== ATTENDANCE BUTTON =====
    const attendanceCardBtn = document.getElementById('attendanceCardBtn');
    if (attendanceCardBtn) {
        attendanceCardBtn.addEventListener('click', () => {
            if (finalStudentId) {
                window.location.href = `Attendance.html?id=${finalStudentId}`;
            } else {
                window.location.href = 'Attendance.html';
            }
        });
    }

    // ===== BLOOD DONATION BUTTON =====
    const bloodDonationBtn = document.getElementById('bloodDonationBtn');
    if (bloodDonationBtn) {
        bloodDonationBtn.addEventListener('click', () => {
            window.open('https://blood-donation-community.vercel.app/', '_blank');
        });
    }

    // ===== FACE REGISTRATION BUTTON =====
    const faceRegisterBtn = document.getElementById('faceRegisterBtn');
    if (faceRegisterBtn) {
        faceRegisterBtn.addEventListener('click', () => {
            console.log('👤 Face Register button clicked');
            console.log('🆔 Using Student ID:', finalStudentId);
            
            if (!finalStudentId) {
                if (typeof showToast === 'function') {
                    showToast("❌ Student ID not found. Please log in again.", "error");
                } else {
                    alert('❌ Student ID not found. Please log in again.');
                }
                return;
            }

            console.log('✅ Redirecting to FaceRegister.html with ID:', finalStudentId);
            window.location.href = `FaceRegister.html?studentId=${finalStudentId}`;
        });
    }

    // ===== SOS EMERGENCY BUTTON =====
    const sosBtn = document.querySelector('.card.sos .sos-btn');
    if (sosBtn) {
        sosBtn.addEventListener('click', async () => {
            console.log('🆘 SOS button clicked');
            
            if (!finalStudentId) {
                if (typeof showToast === 'function') {
                    showToast("❌ User ID not found. Please log in again.", "error");
                } else {
                    alert('❌ User ID not found. Please log in again.');
                }
                return;
            }

            sosBtn.disabled = true;
            sosBtn.textContent = 'Sending...';

            try {
                console.log('📡 Fetching user data for:', finalStudentId);
                
                const snapshot = await firebase.database().ref(`users/${finalStudentId}`).once('value');
                const userData = snapshot.val() || {};
                
                console.log('📋 User data:', userData);
                
                const studentName = userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(' ') || "Unknown";
                const roomNumber = userData.room_number || userData.room || "Not assigned";

                console.log('💾 Saving SOS alert...');
                
                const alertId = `sos_${finalStudentId}_${Date.now()}`;
                await firebase.firestore().collection('sos_alerts').doc(alertId).set({
                    studentId: finalStudentId,
                    studentName: studentName,
                    roomNumber: roomNumber,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                });

                console.log('✅ SOS alert sent successfully');
                
                if (typeof showToast === 'function') {
                    showToast(`✅ SOS alert sent! Admin has been notified. (Room: ${roomNumber})`, "success");
                } else {
                    alert(`✅ SOS alert sent! Admin has been notified. (Room: ${roomNumber})`);
                }
            } catch (error) {
                console.error("❌ SOS error:", error);
                if (typeof showToast === 'function') {
                    showToast("❌ Failed to send SOS alert. Please try again.", "error");
                } else {
                    alert("❌ Failed to send SOS alert. Please try again.");
                }
            } finally {
                sosBtn.disabled = false;
                sosBtn.textContent = 'Send SOS';
            }
        });
    }

    // Log all available data on page load
    console.log('📊 Dashboard initialized with:');
    console.log('  - URL:', window.location.href);
    console.log('  - Student ID:', finalStudentId);
    console.log('  - Buttons found:', {
        complaint: !!complaintBtn,
        attendance: !!attendanceCardBtn,
        faceRegister: !!faceRegisterBtn,
        sos: !!sosBtn,
        blood: !!bloodDonationBtn
    });
});