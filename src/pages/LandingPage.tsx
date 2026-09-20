import React from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Sparkles, Flame, ShieldCheck, Calendar, Users, ArrowRight, Heart, CheckCircle2, Star } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToDemo,
}) => {
  return (
    <div className="gt-landing">
      {/* Navigation Header */}
      <header className="gt-landing-nav">
        <div className="gt-landing-brand">
          <div className="gt-landing-logo">
            <Sparkles size={20} />
          </div>
          <span className="gt-landing-title">GrowTogether</span>
        </div>

        <nav className="gt-landing-links">
          <a href="#features">Features</a>
          <a href="#philosophy">Philosophy</a>
          <a href="#community">Community</a>
        </nav>

        <div className="gt-landing-actions">
          <Button variant="ghost" onClick={onNavigateToLogin}>Sign In</Button>
          <Button variant="primary" onClick={onNavigateToSignup}>Get Started Free</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gt-hero">
        <div className="gt-hero-content">
          <Badge variant="emerald" icon={<Sparkles size={14} />}>
            Build yourself. Grow together.
          </Badge>

          <h1 className="gt-hero-title">
            The Habit Tracker & Friendship Accountability Platform.
          </h1>

          <p className="gt-hero-subtitle">
            Transform your daily routines, time-block your schedule, and stay motivated alongside trusted friends in a calm, beautifully designed workspace.
          </p>

          <div className="gt-hero-cta">
            <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} onClick={onNavigateToSignup}>
              Start Your Free Journey
            </Button>
            <Button variant="secondary" size="lg" onClick={onNavigateToDemo}>
              Explore Live Demo
            </Button>
          </div>

          <div className="gt-hero-social-proof">
            <div className="gt-avatars-group">
              <span className="av av1">M</span>
              <span className="av av2">D</span>
              <span className="av av3">S</span>
              <span className="av av4">A</span>
            </div>
            <div className="gt-proof-text">
              <div className="gt-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span>Loved by 12,000+ daily goal achievers</span>
            </div>
          </div>
        </div>

        {/* Interactive App Preview Showcase */}
        <div className="gt-hero-preview">
          <Card emeraldGlow className="gt-showcase-card">
            <div className="gt-showcase-header">
              <div className="gt-showcase-user">
                <div className="gt-showcase-avatar">A</div>
                <div>
                  <strong>Alex Rivers</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Today's Commitment</div>
                </div>
              </div>
              <Badge variant="amber" icon={<Flame size={12} />}>14 Day Streak 🔥</Badge>
            </div>

            <div className="gt-showcase-habits">
              <div className="gt-showcase-item done">
                <CheckCircle2 size={18} color="var(--primary-400)" />
                <span>Morning Meditation & Breathwork</span>
                <Badge variant="emerald">Morning</Badge>
              </div>
              <div className="gt-showcase-item done">
                <CheckCircle2 size={18} color="var(--primary-400)" />
                <span>2.5L Water Intake</span>
                <Badge variant="emerald">All Day</Badge>
              </div>
              <div className="gt-showcase-item">
                <div className="gt-circle-placeholder" />
                <span>30 Min Deep Reading</span>
                <Badge variant="cyan">Afternoon</Badge>
              </div>
            </div>

            <div className="gt-showcase-activity">
              <div className="gt-activity-pill">
                <Heart size={14} color="#ec4899" fill="#ec4899" />
                <span>Maya Lin cheered your 14-day streak milestone!</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="gt-features-section">
        <div className="gt-section-header">
          <Badge variant="purple">Core Capabilities</Badge>
          <h2>Everything you need for sustainable growth</h2>
          <p>Built with intentional simplicity to encourage focus without digital distraction.</p>
        </div>

        <div className="gt-features-grid">
          <Card className="gt-feature-card">
            <div className="gt-feature-icon emerald">
              <ShieldCheck size={24} />
            </div>
            <h3>Habit & Streak Tracker</h3>
            <p>Stack habits by time of day, set frequency goals, and preserve your momentum with streak freeze safeguards.</p>
          </Card>

          <Card className="gt-feature-card">
            <div className="gt-feature-icon cyan">
              <Calendar size={24} />
            </div>
            <h3>Time-Blocked Planner</h3>
            <p>Schedule your day, week, and month seamlessly. Turn task priorities into dedicated focus blocks on your calendar.</p>
          </Card>

          <Card className="gt-feature-card">
            <div className="gt-feature-icon purple">
              <Users size={24} />
            </div>
            <h3>Friendship Accountability</h3>
            <p>Share progress with close friends. Cheer achievements, send supportive nudges, and conquer goals together.</p>
          </Card>
        </div>
      </section>

      {/* Philosophy Banner */}
      <section id="philosophy" className="gt-philosophy-banner">
        <div className="gt-philosophy-content">
          <Sparkles size={32} color="var(--primary-400)" />
          <blockquote>
            "Build yourself. Grow together."
          </blockquote>
          <p>
            Self-improvement is far more rewarding when shared with people who uplift you.
          </p>
          <Button variant="primary" size="lg" onClick={onNavigateToSignup}>
            Join the GrowTogether Community
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="gt-landing-footer">
        <div className="gt-footer-left">
          <div className="gt-landing-brand">
            <div className="gt-landing-logo">
              <Sparkles size={16} />
            </div>
            <span>GrowTogether</span>
          </div>
          <p>© 2026 GrowTogether Inc. All rights reserved.</p>
        </div>
        <div className="gt-footer-links">
          <a href="#features">Privacy Policy</a>
          <a href="#features">Terms of Service</a>
          <a href="#features">Support & Community</a>
        </div>
      </footer>

      <style>{`
        .gt-landing {
          min-height: 100vh;
          background-color: var(--bg-app);
          color: var(--text-primary);
        }

        .gt-landing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          background: rgba(9, 13, 22, 0.8);
          backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid var(--border-subtle);
        }

        .gt-landing-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .gt-landing-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 16px var(--primary-glow);
        }

        .gt-landing-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.25rem;
          background: linear-gradient(135deg, #ffffff, #a7f3d0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gt-landing-links {
          display: none;
          gap: 2rem;
          font-weight: 500;
          font-size: 0.925rem;
          color: var(--text-secondary);
        }

        @media (min-width: 768px) {
          .gt-landing-links { display: flex; }
        }

        .gt-landing-links a:hover {
          color: white;
        }

        .gt-landing-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* Hero */
        .gt-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          padding: 4rem 2rem 5rem 2rem;
          max-width: 1300px;
          margin: 0 auto;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .gt-hero {
            grid-template-columns: 1fr 1fr;
            padding: 6rem 2.5rem 7rem 2.5rem;
          }
        }

        .gt-hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .gt-hero-title {
          font-size: 2.75rem;
          line-height: 1.15;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 30%, #a7f3d0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (min-width: 768px) {
          .gt-hero-title { font-size: 3.5rem; }
        }

        .gt-hero-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 540px;
        }

        .gt-hero-cta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .gt-hero-social-proof {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .gt-avatars-group {
          display: flex;
        }

        .av {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.8rem;
          border: 2px solid var(--bg-app);
          margin-left: -8px;
        }

        .av1 { margin-left: 0; background: linear-gradient(135deg, #ec4899, #8b5cf6); }
        .av2 { background: linear-gradient(135deg, #3b82f6, #10b981); }
        .av3 { background: linear-gradient(135deg, #f59e0b, #ec4899); }
        .av4 { background: linear-gradient(135deg, #10b981, #059669); }

        .gt-proof-text {
          display: flex;
          flex-direction: column;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .gt-stars {
          display: flex;
          gap: 2px;
        }

        .gt-showcase-card {
          padding: 1.75rem;
          border: 1px solid var(--border-emerald);
          box-shadow: 0 20px 50px rgba(16, 185, 129, 0.15);
        }

        .gt-showcase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .gt-showcase-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .gt-showcase-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--purple-indigo), var(--rose-pink));
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gt-showcase-habits {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .gt-showcase-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .gt-showcase-item.done {
          background: rgba(16, 185, 129, 0.08);
          border-color: var(--border-emerald);
        }

        .gt-circle-placeholder {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--text-muted);
        }

        .gt-showcase-activity {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }

        .gt-activity-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          color: var(--text-primary);
          background: rgba(236, 72, 153, 0.1);
          border: 1px solid rgba(236, 72, 153, 0.2);
          padding: 0.5rem 0.875rem;
          border-radius: var(--radius-full);
        }

        /* Features Section */
        .gt-features-section {
          padding: 5rem 2rem;
          max-width: 1300px;
          margin: 0 auto;
        }

        .gt-section-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          max-width: 600px;
          margin: 0 auto 3.5rem auto;
        }

        .gt-section-header h2 {
          font-size: 2.25rem;
        }

        .gt-section-header p {
          color: var(--text-secondary);
        }

        .gt-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .gt-feature-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .gt-feature-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gt-feature-icon.emerald { background: var(--primary-soft); color: var(--primary-400); }
        .gt-feature-icon.cyan { background: var(--cyan-soft); color: var(--cyan-teal); }
        .gt-feature-icon.purple { background: var(--purple-soft); color: var(--purple-indigo); }

        /* Philosophy Banner */
        .gt-philosophy-banner {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          padding: 6rem 2rem;
          text-align: center;
        }

        .gt-philosophy-content {
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .gt-philosophy-content blockquote {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff, #a7f3d0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gt-philosophy-content p {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        /* Footer */
        .gt-landing-footer {
          padding: 3rem 2.5rem;
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        @media (min-width: 768px) {
          .gt-landing-footer {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .gt-footer-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .gt-footer-links {
          display: flex;
          gap: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .gt-footer-links a:hover { color: white; }
      `}</style>
    </div>
  );
};
