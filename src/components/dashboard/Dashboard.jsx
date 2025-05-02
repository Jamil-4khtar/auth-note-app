import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import DarkModeToggle from '../common/DarkModeToggle';

export default function Dashboard({ darkMode, toggleDarkMode }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'notes'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const notesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotes(notesData);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError(error.message);
        setTimeout(() => setError(null), 5000);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [currentUser, navigate]);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim() || !currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'notes'), {
        content: newNote,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      setNewNote('');
      const q = query(collection(db, 'notes'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const notesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
    } catch (error) {
      console.error('Error adding note:', error);
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!currentUser) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      const q = query(collection(db, 'notes'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const notesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background text-foreground transition-colors"
    >
      <nav className="bg-white/90 dark:bg-neutral-900/90 shadow-lg transition-colors border-b border-border dark:border-neutral-800 backdrop-blur relative">
        <div className="max-w-full mx-auto px-4 flex sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/image.png" alt="Logo" className="h-20 w-20 sm:h-20 sm:w-20" />
            {/* <h1 className="text-lg sm:text-2xl font-bold text-foreground dark:text-white tracking-tight">Notes Dashboard</h1> */}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
            {/* Dashboard-specific dark mode toggle */}
            <DarkModeToggle
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              className="p-2 sm:p-3 rounded-full border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 shadow-lg hover:scale-105 transition-all duration-200 backdrop-blur"
            />
            <button
              onClick={handleLogout}
              className="px-4 sm:px-5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-foreground dark:text-white border border-border dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow transition-all duration-200 text-sm sm:text-base"
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-full sm:max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <div className="bg-white/95 dark:bg-neutral-900/95 shadow-2xl rounded-2xl p-4 sm:p-8 transition-colors border border-border dark:border-neutral-800 backdrop-blur">
          <form onSubmit={handleAddNote} className="mb-6 sm:mb-10">
            <div>
              <label htmlFor="note" className="block text-base font-semibold text-foreground dark:text-neutral-200 mb-2">
                Add a new note
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  name="note"
                  id="note"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-border dark:border-neutral-700 bg-background dark:bg-neutral-800 text-foreground dark:text-white focus:ring-2 focus:ring-indigo-400 sm:text-base text-sm transition-colors shadow"
                  placeholder="Write your note here"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  autoComplete="off"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all duration-200 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : 'Add Note'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 mt-2">
              <div className="bg-destructive/15 dark:bg-red-900/30 text-destructive dark:text-red-300 px-4 py-2 rounded-md transition-colors text-sm sm:text-base">
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4 text-foreground dark:text-neutral-200 text-sm sm:text-base">Loading...</div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {notes.length === 0 ? (
                <p className="text-muted-foreground dark:text-neutral-400 text-center text-sm sm:text-base">No notes yet. Create one above!</p>
              ) : (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-neutral-50 dark:bg-neutral-800 p-3 sm:p-5 rounded-xl shadow flex flex-col sm:flex-row justify-between items-start sm:items-center border border-border dark:border-neutral-700 transition-all duration-200"
                  >
                    <p className="text-base sm:text-lg text-foreground dark:text-white break-words">{note.content}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="mt-2 sm:mt-0 sm:ml-4 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow"
                      type="button"
                      aria-label="Delete note"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}