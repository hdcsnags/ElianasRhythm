import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { StarField } from '../components/companion/StarField'
import { LandingHero } from '../components/landing/LandingHero'
import { LandingStory } from '../components/landing/LandingStory'
import { LandingModes } from '../components/landing/LandingModes'
import { LandingUiPreview } from '../components/landing/LandingUiPreview'
import { LandingTheology } from '../components/landing/LandingTheology'
import { LandingFeatures } from '../components/landing/LandingFeatures'
import { LandingStack } from '../components/landing/LandingStack'
import { LandingFooter } from '../components/landing/LandingFooter'
import { Divider } from '../components/landing/Divider'

export default function LandingPage() {
  const navigate = useNavigate()
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const els = mainRef.current?.querySelectorAll('.reveal')
    els?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleExperience = () => navigate('/companion')

  return (
    <div ref={mainRef} className="bg-night text-cream overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <StarField count={120} />
      </div>

      <LandingHero onExperience={handleExperience} />

      <LandingStory />

      <Divider text="Three Modes &middot; One Soul" />

      <LandingModes onExperience={handleExperience} />

      <LandingUiPreview />

      <LandingTheology />

      <LandingFeatures />

      <LandingStack />

      <LandingFooter onExperience={handleExperience} />
    </div>
  )
}
