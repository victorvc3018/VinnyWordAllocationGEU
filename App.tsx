import { useState, useEffect } from 'react';
import { User, Submission, StudentRecord, AppData } from './types';
import LoginPage from './components/LoginPage';
import SubmissionDashboard from './components/WordDashboard';
import Header from './components/Header';
import { useLocalStorage } from './hooks/useLocalStorage'; // Keep for user session
import { db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

const INITIAL_STUDENT_LIST: StudentRecord[] = [
  // This list is now only used to seed the database once.
  { rollNo: '1', name: 'ADITYA PUNDIR' }, { rollNo: '2', name: 'Aditya Singh' }, { rollNo: '3', name: 'AKSHITA' }, { rollNo: '4', name: 'ASHITA PUNDIR' }, { rollNo: '5', name: 'Bilawal Ansari' }, { rollNo: '6', name: 'CHANDRASHEKHAR KUMAR' }, { rollNo: '7', name: 'DEVANSH TRIPATHI' }, { rollNo: '8', name: 'KAVY DHAMI' }, { rollNo: '9', name: 'MANISHA BISHT' }, { rollNo: '10', name: 'PARIS DANIA KAKARAYA' }, { rollNo: '11', name: 'PRINCE AWASTHI' }, { rollNo: '12', name: 'PRIYANSHI AGARWAL' }, { rollNo: '13', name: 'Ronit Rai' }, { rollNo: '14', name: 'SAHIL PANDEY' }, { rollNo: '15', name: 'SHWE CHIN ENG' }, { rollNo: '16', name: 'TANUJ SHARMA' }, { rollNo: '17', name: 'VIBHUTI GUPTA' }, { rollNo: '18', name: 'VIKAS SINGH MEHTA' }, { rollNo: '19', name: 'YASH CHAUDHARY' }, { rollNo: '20', name: 'ALANKRIT JUGLAN' }, { rollNo: '21', name: 'ARJUN RANA' }, { rollNo: '22', name: 'ARYAN RANA' }, { rollNo: '23', name: 'DEEP CHAKRABORTY' }, { rollNo: '24', name: 'MANTHAN SINGH' }, { rollNo: '25', name: 'PARV KAIM' }, { rollNo: '26', name: 'RISHIKA GUPTA' }, { rollNo: '27', name: 'Shashwat Sharma' }, { rollNo: '28', name: 'SHREYA SINGH' }, { rollNo: '29', name: 'SIYAVUYA RANNIE STEWART' }, { rollNo: '30', name: 'TANISHQ PEGOWAL' }, { rollNo: '31', name: 'TSEPO MAKHETHA' }, { rollNo: '32', name: 'vaibhav vashishth' }, { rollNo: '33', name: 'Yug bhardwaj' }, { rollNo: '34', name: 'AJIT SINGH' }, { rollNo: '35', name: 'AMAN ASHUTOSH NEGI' }, { rollNo: '36', name: 'ASHU RAI' }, { rollNo: '37', name: 'Vishwas Singh Yadav' }, { rollNo: '38', name: 'PARDEEP KUMAR' }, { rollNo: '39', name: 'ZIN MIN HTUT' }, { rollNo: '40', name: 'NAKUL JAIN' }, { rollNo: '41', name: 'PEEYUSH BUTOLA' }, { rollNo: '42', name: 'PARV GUPTA' }, { rollNo: '43', name: 'SARTHAK SHARMA' }, { rollNo: '44', name: 'HARSH KUMAR' }, { rollNo: '45', name: 'UTTKARSH VISHWAKARMA' }, { rollNo: '46', name: 'NATHAN F T GAYILEE' }, { rollNo: '47', name: 'ANUBHAV' }, { rollNo: '48', name: 'THASHVI SREE PRIYA JAMI' }, { rollNo: '49', name: 'AYUSH KUMAR' }, { rollNo: '50', name: 'PIYUSH KUMAR' }, { rollNo: '51', name: 'STANZIN RIGZIN' }, { rollNo: '52', name: 'VANSH SHARMA' }, { rollNo: '53', name: 'PETER ZO AWM LIAN' }, { rollNo: '54', name: 'AYUSH' }, { rollNo: '55', name: 'KRISH CHOURAGADE' }, { rollNo: '56', name: 'Navneet Pandit' }, { rollNo: '57', name: 'PURNIMA' }, { rollNo: '58', name: 'Bhavya' }, { rollNo: '59', name: 'Kartik Nokwhal' }, { rollNo: '60', name: 'MOULI KACCHAL' }, { rollNo: '61', name: 'priyanshu mittal' }, { rollNo: '62', name: 'MANELISA SINNEFALETHU KUN' }, { rollNo: '63', name: 'AKSHAY LAKHERA' }, { rollNo: '64', name: 'VISHESH PAL' }, { rollNo: '65', name: 'SURYANSH SAINI' }, { rollNo: '66', name: 'TANVI TRIPATHI' }, { rollNo: '67', name: 'vinamra' }, { rollNo: '68', name: 'BOBBY TOMAH' }, { rollNo: '69', name: 'ABHISHAL SINGH' }, { rollNo: '70', name: 'SHRISTY GARG' }, { rollNo: '71', name: 'KUSH DIXIT' }, { rollNo: '72', name: 'ADARSH SINGH KATHAIT' }, { rollNo: '73', name: 'SAMEER SHARMA' }, { rollNo: '74', name: 'KHUSHAL AHUJA' }, { rollNo: '75', name: 'AASHMITA NAIR' }, { rollNo: '76', name: 'SHREYA JAISWAL' }, { rollNo: '77', name: 'VAANI SINGH' }, { rollNo: '78', name: 'ASHISH SINGH' }, { rollNo: '79', name: 'REUBEN ISRAEL KANU' }, { rollNo: '80', name: 'JANE NYATOCH GATWECH GAI' }, { rollNo: '81', name: 'parth pharasi' }, { rollNo: '82', name: 'Olufemi E During' }, { rollNo: '83', name: 'Lung Tun Aung' }, { rollNo: '84', name: 'Vanessa Moio' }, { rollNo: '85', name: 'Siwakhile Lunathi Mzizi' }, { rollNo: '86', name: 'Redda Dodum' }, { rollNo: '87', name: 'Edwin Demo' }, { rollNo: '88', name: 'Sevens' }, { rollNo: '89', name: '[Empty Slot]' },
];

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('word-app-user', null);
  const [appData, setAppData] = useState<AppData>({
      submissions: [],
      isLocked: false,
      studentList: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Set up a real-time listener for our app data
  useEffect(() => {
    // We store all our data in a single document for simplicity
    const docRef = doc(db, "appState", "main");

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setAppData(doc.data() as AppData);
      } else {
        // If the document doesn't exist, create it with initial data
        console.log("No data found in Firestore, seeding initial data...");
        const initialData: AppData = {
          submissions: [],
          isLocked: false,
          studentList: INITIAL_STUDENT_LIST
        };
        setDoc(docRef, initialData).then(() => setAppData(initialData));
      }
      setIsLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  // All data modification functions now update Firestore directly
  const dataRef = doc(db, "appState", "main");

  const updateSubmissions = (newSubmissions: Submission[]) => {
    updateDoc(dataRef, { submissions: newSubmissions });
  };

  const updateStudentList = (newStudentList: StudentRecord[]) => {
    updateDoc(dataRef, { studentList: newStudentList });
  };

  const updateLockState = (isLocked: boolean) => {
    updateDoc(dataRef, { isLocked: isLocked });
  };

  if (isLoading && !currentUser) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
              <p className="text-xl">Loading Student Data...</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {!currentUser ? (
        <LoginPage onLogin={handleLogin} studentList={appData.studentList} />
      ) : (
        <>
          <Header user={currentUser} onLogout={handleLogout} />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <SubmissionDashboard 
              currentUser={currentUser} 
              submissions={appData.submissions}
              setSubmissions={updateSubmissions}
              isLocked={appData.isLocked}
              setIsLocked={updateLockState}
              studentList={appData.studentList}
              setStudentList={updateStudentList}
            />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
