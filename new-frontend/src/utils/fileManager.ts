// File management utility for LabRooms
export interface SavedFile {
  id: string
  name: string
  content: string
  type: 'code' | 'document' | 'other'
  createdAt: Date
  lastModified: Date
  size: number
}

export class FileManager {
  private static STORAGE_KEY = 'labrooms_saved_files'

  // Get all saved files from localStorage
  static getSavedFiles(): SavedFile[] {
    try {
      const files = localStorage.getItem(this.STORAGE_KEY)
      return files ? JSON.parse(files) : []
    } catch (error) {
      console.error('Error loading saved files:', error)
      return []
    }
  }

  // Save a new file
  static saveFile(name: string, content: string, type: 'code' | 'document' | 'other' = 'code'): SavedFile {
    const files = this.getSavedFiles()
    const now = new Date()
    
    const newFile: SavedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.ensureFileExtension(name, type),
      content,
      type,
      createdAt: now,
      lastModified: now,
      size: new Blob([content]).size
    }

    // Check if file with same name exists
    const existingIndex = files.findIndex(file => file.name === newFile.name)
    if (existingIndex >= 0) {
      // Update existing file
      files[existingIndex] = { ...newFile, createdAt: files[existingIndex].createdAt }
    } else {
      // Add new file
      files.push(newFile)
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files))
    } catch (error) {
      console.error('Error saving file:', error)
      throw new Error('Failed to save file. Storage might be full.')
    }

    return newFile
  }

  // Delete a file
  static deleteFile(fileId: string): boolean {
    try {
      const files = this.getSavedFiles()
      const filteredFiles = files.filter(file => file.id !== fileId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredFiles))
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  // Get a specific file by ID
  static getFile(fileId: string): SavedFile | null {
    const files = this.getSavedFiles()
    return files.find(file => file.id === fileId) || null
  }

  // Update file content
  static updateFile(fileId: string, content: string): SavedFile | null {
    try {
      const files = this.getSavedFiles()
      const fileIndex = files.findIndex(file => file.id === fileId)
      
      if (fileIndex >= 0) {
        files[fileIndex].content = content
        files[fileIndex].lastModified = new Date()
        files[fileIndex].size = new Blob([content]).size
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files))
        return files[fileIndex]
      }
      return null
    } catch (error) {
      console.error('Error updating file:', error)
      return null
    }
  }

  // Generate file name with extension based on content
  static generateFileName(content: string): string {
    const trimmedContent = content.trim().toLowerCase()
    
    // Detect file type from content
    if (trimmedContent.includes('public class') || trimmedContent.includes('class ')) {
      const classMatch = content.match(/(?:public\s+)?class\s+(\w+)/i)
      if (classMatch) {
        return `${classMatch[1]}.java`
      }
      return 'Main.java'
    } else if (trimmedContent.includes('function ') || trimmedContent.includes('const ') || trimmedContent.includes('let ')) {
      return 'script.js'
    } else if (trimmedContent.includes('def ') || trimmedContent.includes('import ')) {
      return 'script.py'
    } else if (trimmedContent.includes('#include') || trimmedContent.includes('int main')) {
      return 'main.cpp'
    } else if (trimmedContent.includes('<html') || trimmedContent.includes('<!doctype')) {
      return 'index.html'
    } else if (trimmedContent.includes('body {') || trimmedContent.includes('.class')) {
      return 'styles.css'
    } else {
      return 'code.txt'
    }
  }

  // Ensure file has proper extension
  private static ensureFileExtension(name: string, type: 'code' | 'document' | 'other'): string {
    if (name.includes('.')) {
      return name
    }
    
    switch (type) {
      case 'code':
        return `${name}.java` // Default to Java if no extension
      case 'document':
        return `${name}.txt`
      default:
        return `${name}.txt`
    }
  }

  // Format file size for display
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Format date for display
  static formatDate(date: Date): string {
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Export file content for download
  static downloadFile(file: SavedFile): void {
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Clear all saved files
  static clearAllFiles(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Error clearing files:', error)
      return false
    }
  }
}
