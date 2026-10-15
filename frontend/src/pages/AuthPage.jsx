import { useState } from 'react'
import { login, signup } from '../api/auth'
import './AuthPage.css'

const MODES = {
  login: { title: '로그인', submit: '로그인하기', working: '로그인하고 있어요.' },
  signup: { title: '회원가입', submit: '가입하기', working: '가입하고 있어요.' },
}

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const isSignup = mode === 'signup'

  function switchMode(next) {
    setMode(next)
    setError('')
    setPassword('')
    setPasswordConfirm('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (isSignup && password !== passwordConfirm) {
      setError('비밀번호 확인이 비밀번호와 달라요. 다시 입력해 주세요.')
      return
    }
    setIsWorking(true)
    try {
      const user = isSignup ? await signup(username, password) : await login(username, password)
      onAuthenticated(user)
    } catch (authError) {
      setError(authError.message || `${MODES[mode].title}하지 못했어요. 다시 시도해 주세요.`)
      setIsWorking(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-emoji" aria-hidden="true">
        {isSignup ? '🥄' : '🍽️'}
      </div>
      <h1 id="auth-title">{MODES[mode].title}</h1>
      <p className="auth-description">
        {isSignup ? '가입하면 내 식당 목록을 따로 저장할 수 있어요.' : '로그인하면 내가 저장한 식당으로 룰렛을 돌릴 수 있어요.'}
      </p>

      <form className="auth-form" onSubmit={submit}>
        <label className="auth-field" htmlFor="auth-username">
          아이디
          <input
            id="auth-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={20}
            aria-describedby={isSignup ? 'auth-username-hint' : undefined}
            required
          />
        </label>
        {isSignup && (
          <p id="auth-username-hint" className="auth-hint">
            영문, 숫자, _로 4~20자예요. 영문 대문자는 소문자로 저장돼요.
          </p>
        )}

        <label className="auth-field" htmlFor="auth-password">
          비밀번호
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={isSignup ? 8 : undefined}
            maxLength={128}
            aria-describedby={isSignup ? 'auth-password-hint' : undefined}
            required
          />
        </label>
        {isSignup && (
          <>
            <p id="auth-password-hint" className="auth-hint">
              8자 이상 입력해 주세요.
            </p>
            <label className="auth-field" htmlFor="auth-password-confirm">
              비밀번호 확인
              <input
                id="auth-password-confirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                maxLength={128}
                required
              />
            </label>
          </>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="primary-button" type="submit" disabled={isWorking}>
          {isWorking ? MODES[mode].working : MODES[mode].submit}
        </button>
      </form>

      <p className="auth-switch">
        {isSignup ? '이미 계정이 있나요?' : '처음이신가요?'}{' '}
        <button type="button" className="auth-switch-button" onClick={() => switchMode(isSignup ? 'login' : 'signup')}>
          {isSignup ? '로그인하기' : '회원가입하기'}
        </button>
      </p>
    </section>
  )
}

export default AuthPage
