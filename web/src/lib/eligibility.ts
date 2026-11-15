import type { CandidateEducation } from '../types'

/**
 * Normalizes text for robust Indian recruitment qualification matching.
 * Handles curly apostrophes, multiple whitespace, and case differences.
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Evaluates whether a candidate's education qualifies for a given required qualification text.
 * Covers Indian recruitment patterns (UPSC, SSC, State PSCs, RRB, Banking, PSUs, Defense).
 */
export function checkSingleQualificationMatch(
  candidateQualRaw: string,
  candidateStreamRaw: string | null | undefined,
  requiredQualRaw: string
): boolean {
  const cQual = normalizeText(candidateQualRaw)
  const cStream = normalizeText(candidateStreamRaw)
  const r = normalizeText(requiredQualRaw)

  // Empty or generic notice text
  if (!r || r.includes('refer official notice') || r.includes('as per official notice')) {
    return true
  }

  // Common umbrella phrases in government recruitment notices:
  // "Degree of a recognised University", "Graduation in any discipline", "Bachelor's degree of any recognised University"
  const isAnyDegree =
    r.includes('degree') ||
    r.includes('graduation') ||
    r.includes('graduate') ||
    r.includes('bachelor') ||
    r.includes('undergraduate') ||
    r.includes('any discipline') ||
    r.includes('recognised university')

  // Engineering & Technical disciplines
  const isEngineering =
    r.includes('engineering') ||
    r.includes('technology') ||
    r.includes('b.tech') ||
    r.includes('b.e.') ||
    r.includes('btech') ||
    r.includes('gate score') ||
    r.includes('technical')

  // Medical & Nursing disciplines
  const isMedical =
    r.includes('m.b.b.s') ||
    r.includes('mbbs') ||
    r.includes('medical') ||
    r.includes('nursing') ||
    r.includes('b.sc nursing') ||
    r.includes('b.sc. nursing') ||
    r.includes('gnm')

  // Law disciplines
  const isLaw = r.includes('ll.b') || r.includes('llb') || r.includes('law')

  // Lower ladder requirements
  const isDiploma = r.includes('diploma') || r.includes('polytechnic')
  const is12th =
    r.includes('12th') ||
    r.includes('intermediate') ||
    r.includes('10+2') ||
    r.includes('higher secondary') ||
    r.includes('senior secondary')
  const is10th =
    r.includes('10th') ||
    r.includes('matriculation') ||
    r.includes('sslc') ||
    r.includes('high school')

  // Post graduate & Doctorate
  const isPostGraduate =
    r.includes('master') ||
    r.includes('post graduation') ||
    r.includes('post graduate') ||
    r.includes('m.tech') ||
    r.includes('m.sc') ||
    r.includes('m.com') ||
    r.includes('m.a') ||
    r.includes('mba') ||
    r.includes('mca')
  const isDoctorate = r.includes('ph.d') || r.includes('phd') || r.includes('doctorate')

  // ── 1. Candidate is Ph.D. / Doctorate ──
  if (cQual.includes('ph.d') || cQual.includes('phd') || cQual.includes('doctorate')) {
    if (!isMedical || cStream.includes('medical') || cStream.includes('nursing')) {
      return true
    }
  }

  // ── 2. Candidate is Master's / Post Graduate ──
  if (
    cQual.includes("master's") ||
    cQual.includes('master') ||
    cQual.includes('post-graduation') ||
    cQual.includes('post graduation')
  ) {
    if (isDoctorate) return false
    if (isMedical && !cStream.includes('medical') && !cStream.includes('nursing')) return false
    return true
  }

  // ── 3. Candidate is B.Tech / B.E. (Engineering Degree) ──
  if (
    cQual.includes('b.tech') ||
    cQual.includes('b.e.') ||
    cQual.includes('engineering') ||
    cQual.includes('technology')
  ) {
    if (isDoctorate || isPostGraduate) return false
    if (isMedical) return false
    if (isLaw && !r.includes('engineering')) return false
    // B.Tech qualifies for Engineering, Any Degree, Diploma (RRB ALP/SSC JE), 12th and 10th
    if (isEngineering || isAnyDegree || isDiploma || is12th || is10th) {
      return true
    }
  }

  // ── 4. Candidate is General Bachelor's Degree (B.A., B.Sc., B.Com, BBA, BCA) ──
  if (
    cQual.includes("bachelor's") ||
    cQual.includes('bachelor') ||
    cQual.includes('graduation') ||
    cQual.includes('graduate')
  ) {
    if (isDoctorate || isPostGraduate) return false
    if (isMedical && !cStream.includes('nursing') && !cStream.includes('medical')) return false
    if (isEngineering && !r.includes('general') && !r.includes('arts') && !r.includes('science') && !r.includes('commerce')) {
      return false
    }
    // Bachelor's qualifies for any general graduate exam, 12th, and 10th
    if (isAnyDegree || is12th || is10th) {
      return true
    }
  }

  // ── 5. Candidate is Diploma / Polytechnic ──
  if (cQual.includes('diploma') || cQual.includes('polytechnic')) {
    if (isDoctorate || isPostGraduate) return false
    if (isEngineering && !r.includes('diploma')) return false
    if (isAnyDegree && !r.includes('diploma')) return false
    if (isDiploma || is12th || is10th) {
      return true
    }
  }

  // ── 6. Candidate is 12th / Intermediate ──
  if (cQual.includes('12th') || cQual.includes('intermediate') || cQual.includes('10+2')) {
    if (isAnyDegree || isDiploma || isPostGraduate || isDoctorate) return false
    if (is12th || is10th) {
      return true
    }
  }

  // ── 7. Candidate is 10th / Matriculation ──
  if (cQual.includes('10th') || cQual.includes('matriculation') || cQual.includes('sslc')) {
    if (isAnyDegree || isDiploma || is12th || isPostGraduate || isDoctorate) return false
    if (is10th) {
      return true
    }
  }

  // Fallback: direct substring match after normalization
  return r.includes(cQual) || cQual.includes(r)
}

/**
 * Checks if candidate has at least one education record satisfying any of the required qualifications.
 */
export function isEducationEligible(
  candidateEducation: CandidateEducation[],
  requiredQualifications: string[] | null | undefined
): boolean {
  if (!requiredQualifications || requiredQualifications.length === 0) {
    return true
  }
  if (!candidateEducation || candidateEducation.length === 0) {
    return false
  }

  return candidateEducation.some((edu) =>
    requiredQualifications.some((rq) =>
      checkSingleQualificationMatch(edu.highest_qualification, edu.stream, rq)
    )
  )
}

/**
 * Calculates candidate age accurately as of today or cutoff date.
 */
export function calculateAge(dobString: string, cutoffDateString?: string | null): number {
  const dob = new Date(dobString)
  const targetDate = cutoffDateString ? new Date(cutoffDateString) : new Date()
  let age = targetDate.getFullYear() - dob.getFullYear()
  const m = targetDate.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && targetDate.getDate() < dob.getDate())) {
    age--
  }
  return age
}

/**
 * Evaluates whether candidate age falls within [minAge, maxAge + ageRelaxation].
 */
export function isAgeEligible(
  candidateAge: number | null,
  minAge: number,
  maxAge: number,
  ageRelaxation: number = 0
): boolean {
  if (candidateAge === null) return true
  const effectiveMax = maxAge + ageRelaxation
  return candidateAge >= minAge && candidateAge <= effectiveMax
}
