'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { User } from '@supabase/supabase-js'
import styles from '../styles/userMenu.module.css'
import { LogIn, FolderOpen, Plus, LogOut, User as UserIcon } from 'lucide-react'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <a href="/auth" className={styles.loginButton}>
          <LogIn size={14} />
          <span>login</span>
        </a>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        <UserIcon size={14} />
        <span className={styles.email}>{user.email}</span>
      </div>
      <a href="/my-sites" className={styles.mySitesButton}>
        <FolderOpen size={14} />
        <span>my sites</span>
      </a>
      <a href="/create" className={styles.createButton}>
        <Plus size={14} />
        <span>create</span>
      </a>
      <button onClick={handleLogout} className={styles.logoutButton}>
        <LogOut size={14} />
        <span>logout</span>
      </button>
    </div>
  )
}
