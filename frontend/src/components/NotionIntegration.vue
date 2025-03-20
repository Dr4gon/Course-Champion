<template>
  <div class="notion-integration">
    <h3>Notion Integration</h3>

    <div v-if="!connected" class="connection-section">
      <p>
        Connect this lesson to your Notion workspace to take notes and track
        your progress.
      </p>
      <button class="btn-connect" @click="connectToNotion">
        <img
          src="../assets/notion-logo.svg"
          alt="Notion Logo"
          class="notion-logo"
        />
        Connect with Notion
      </button>
    </div>

    <div v-else class="connected-section">
      <div class="connection-info">
        <img
          src="../assets/notion-logo.svg"
          alt="Notion Logo"
          class="notion-logo"
        />
        <span>Connected to your Notion workspace</span>
      </div>

      <div class="actions">
        <button class="btn-sync" @click="syncToNotion">
          <i class="fas fa-sync"></i> Sync Notes
        </button>
        <button class="btn-view" @click="openNotionPage">
          <i class="fas fa-external-link-alt"></i> View in Notion
        </button>
        <button class="btn-disconnect" @click="disconnectNotion">
          Disconnect
        </button>
      </div>

      <div class="notes-preview">
        <h4>Your Notes</h4>
        <div v-if="notes.length > 0" class="notes-list">
          <div v-for="(note, index) in notes" :key="index" class="note-item">
            {{ note.text }}
            <span class="note-timestamp">{{
              formatTimestamp(note.timestamp)
            }}</span>
          </div>
        </div>
        <div v-else class="no-notes">
          <p>You haven't added any notes yet.</p>
        </div>

        <div class="add-note">
          <textarea
            v-model="newNote"
            placeholder="Add a new note..."
            @keyup.enter="addNote"
          ></textarea>
          <button @click="addNote" :disabled="!newNote.trim()">Add Note</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotionIntegration",
  props: {
    courseId: {
      type: Number,
      required: true,
    },
    lessonId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      connected: false,
      notionPageUrl: "",
      notes: [],
      newNote: "",
      // In a real application, we would manage this state from an API
      mockNotionConnection: null,
    };
  },
  methods: {
    connectToNotion() {
      // In a real application, we would redirect to Notion OAuth flow
      // For demo purposes, we'll simulate a successful connection

      // Simulate API call delay
      setTimeout(() => {
        this.connected = true;
        this.notionPageUrl = `https://notion.so/random-page-id-${this.courseId}-${this.lessonId}`;

        // Store in localStorage for persistence
        localStorage.setItem(
          `notion_connected_${this.courseId}_${this.lessonId}`,
          "true"
        );
        localStorage.setItem(
          `notion_page_url_${this.courseId}_${this.lessonId}`,
          this.notionPageUrl
        );

        // Load notes from localStorage
        const savedNotes = localStorage.getItem(
          `notion_notes_${this.courseId}_${this.lessonId}`
        );
        if (savedNotes) {
          this.notes = JSON.parse(savedNotes);
        }

        // Emit event to parent component
        this.$emit("notion-connected", {
          courseId: this.courseId,
          lessonId: this.lessonId,
          connected: true,
          pageUrl: this.notionPageUrl,
        });
      }, 1000);
    },

    disconnectNotion() {
      // In a real application, we would revoke the OAuth token
      // For demo purposes, we'll simulate disconnecting

      if (
        confirm(
          "Are you sure you want to disconnect from Notion? Your notes will remain saved locally."
        )
      ) {
        this.connected = false;
        this.notionPageUrl = "";

        // Update localStorage
        localStorage.removeItem(
          `notion_connected_${this.courseId}_${this.lessonId}`
        );
        localStorage.removeItem(
          `notion_page_url_${this.courseId}_${this.lessonId}`
        );

        // We'll keep the notes saved locally for demonstration purposes
      }
    },

    syncToNotion() {
      // In a real application, we would sync notes to Notion via API
      // For demo purposes, we'll simulate a sync

      // Show loading state
      const btn = event.target;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
      btn.disabled = true;

      // Simulate API call delay
      setTimeout(() => {
        // Reset button state
        btn.innerHTML = originalText;
        btn.disabled = false;

        // Show success message
        alert("Notes synced to Notion successfully!");

        // Emit event to parent component
        this.$emit("notion-synced", {
          courseId: this.courseId,
          lessonId: this.lessonId,
          notes: this.notes,
        });
      }, 1500);
    },

    openNotionPage() {
      // Open Notion page in a new tab
      if (this.notionPageUrl) {
        window.open(this.notionPageUrl, "_blank");
      }
    },

    addNote() {
      if (this.newNote.trim()) {
        // Add note to array
        const note = {
          text: this.newNote.trim(),
          timestamp: new Date().toISOString(),
        };

        this.notes.push(note);
        this.newNote = ""; // Clear input

        // Save to localStorage
        localStorage.setItem(
          `notion_notes_${this.courseId}_${this.lessonId}`,
          JSON.stringify(this.notes)
        );
      }
    },

    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
  },
  created() {
    // Check if already connected from localStorage
    const connected = localStorage.getItem(
      `notion_connected_${this.courseId}_${this.lessonId}`
    );
    const pageUrl = localStorage.getItem(
      `notion_page_url_${this.courseId}_${this.lessonId}`
    );

    if (connected === "true" && pageUrl) {
      this.connected = true;
      this.notionPageUrl = pageUrl;

      // Load notes from localStorage
      const savedNotes = localStorage.getItem(
        `notion_notes_${this.courseId}_${this.lessonId}`
      );
      if (savedNotes) {
        this.notes = JSON.parse(savedNotes);
      }
    }
  },
};
</script>

<style scoped>
.notion-integration {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f7f7f7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #333;
}

.notion-logo {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  vertical-align: middle;
}

.connection-section {
  text-align: center;
  padding: 1rem 0;
}

.connection-section p {
  margin-bottom: 1rem;
  color: #555;
}

.btn-connect {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-connect:hover {
  background-color: #333;
}

.connected-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.connection-info {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  color: #333;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sync {
  background-color: #4a89dc;
  color: white;
}

.btn-view {
  background-color: #5cb85c;
  color: white;
}

.btn-disconnect {
  background-color: transparent;
  border: 1px solid #ccc !important;
  color: #666;
}

.notes-preview {
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.notes-preview h4 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.notes-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.note-item {
  padding: 0.7rem;
  background-color: white;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  border-left: 3px solid #4a89dc;
  font-size: 0.9rem;
  position: relative;
}

.note-timestamp {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.3rem;
}

.no-notes {
  padding: 1rem;
  text-align: center;
  color: #666;
  background-color: #f1f1f1;
  border-radius: 4px;
}

.add-note {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-note textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.add-note button {
  align-self: flex-end;
  padding: 0.5rem 1rem;
  background-color: #4a89dc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-note button:disabled {
  background-color: #b8c6db;
  cursor: not-allowed;
}
</style>
