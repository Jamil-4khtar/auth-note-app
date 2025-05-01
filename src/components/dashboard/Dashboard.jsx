import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Sun, Moon } from 'lucide-react';
import { testFirestoreConnection } from '../../config/firebase';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [error, setError] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      testFirestoreConnection();
    }
  }, [currentUser]);

  // Sync dark mode with DOM and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Fetch notes on mount or when user changes
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
        setTimeout(() => setError(null), 5000); // Clear error after 5s
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [currentUser, navigate]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

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
      // Refresh notes
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
      setTimeout(() => setError(null), 5000); // Clear error after 5s
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!currentUser) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      // Refresh notes
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
      setTimeout(() => setError(null), 5000); // Clear error after 5s
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
      setTimeout(() => setError(null), 5000); // Clear error after 5s
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <nav className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-foreground">Notes Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="btn-ghost p-2 rounded-full"
              aria-label="Toggle dark mode"
              type="button"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="btn-primary px-4 py-2"
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card shadow sm:rounded-lg p-6">
          <form onSubmit={handleAddNote} className="mb-8">
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-foreground">
                Add a new note
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="note"
                  id="note"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border bg-background text-foreground focus:ring-2 focus:ring-ring sm:text-sm"
                  placeholder="Write your note here"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="btn-primary ml-3 py-2 px-4 relative"
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
            <div className="max-w-7xl mx-auto px-4 py-2 mt-2">
              <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4 text-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-muted-foreground text-center">No notes yet. Create one above!</p>
              ) : (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-muted p-4 rounded-lg shadow-sm flex justify-between items-center"
                  >
                    <p className="text-foreground">{note.content}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="btn-destructive ml-4 px-2 py-1 text-sm"
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