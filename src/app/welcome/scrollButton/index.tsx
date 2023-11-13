'use client'

import styles from './index.module.scss'

export default function ScrollButton() {
  return (
    <span id="isHidden" className={styles['scroll-btn']}>
      <a href="#">
        <span className={styles['mouse']}>
          <span></span>
        </span>
      </a>
      <p className={styles['action-btn']}>scroll me</p>
    </span>
  )
}
