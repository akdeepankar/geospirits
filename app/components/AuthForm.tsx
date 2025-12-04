'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import styles from '../styles/auth.module.css'
import { Mail, Lock, LogIn, UserPlus, ArrowLeft } from 'lucide-react'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        setMessage({ type: 'success', text: 'Logged in successfully!' })
        window.location.href = '/'
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        setMessage({ 
          type: 'success', 
          text: 'Registration successful! Check your email to confirm your account.' 
        })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButton}>
        <ArrowLeft size={14} />
        <span>home</span>
      </a>
      
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h1 className={styles.appName}>geo spirits</h1>
          <h2 className={styles.title}>{isLogin ? 'login' : 'register'}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              <Mail size={14} />
              <span>email</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              <Lock size={14} />
              <span>password</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={styles.button}
          >
            {isLogin ? <LogIn size={14} /> : <UserPlus size={14} />}
            <span>{loading ? 'loading...' : isLogin ? 'login' : 'register'}</span>
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setMessage(null)
          }}
          className={styles.toggleButton}
        >
          {isLogin ? "don't have an account? register" : 'already have an account? login'}
        </button>
      </div>
    </div>
  )
}
