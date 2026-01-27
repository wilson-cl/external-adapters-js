import { hashToAum } from '../../src/transport/insurance-proof'
import { createHash } from 'crypto'

describe('hashToAum', () => {
  const TWO_POW_191 = BigInt(2) ** BigInt(191)

  describe('SHA-256 hash computation', () => {
    it('computes SHA-256 of input and converts to BigInt mod 2^191', () => {
      const input = '0xabc123def456'
      const result = hashToAum(input)

      // Manually compute expected value
      const sha256Hash = createHash('sha256').update(input).digest('hex')
      const bigIntValue = BigInt('0x' + sha256Hash)
      const expected = (bigIntValue % TWO_POW_191).toString()

      expect(result).toBe(expected)
    })

    it('returns a decimal string representation', () => {
      const result = hashToAum('test-hash')

      // Result should be a valid decimal string (no hex prefix, only digits)
      expect(result).toMatch(/^\d+$/)
    })
  })

  describe('modulo 2^191 constraint', () => {
    it('returns value less than 2^191', () => {
      const result = hashToAum('any-input-string')
      const resultBigInt = BigInt(result)

      expect(resultBigInt < TWO_POW_191).toBe(true)
    })

    it('returns non-negative value', () => {
      const result = hashToAum('test')
      const resultBigInt = BigInt(result)

      expect(resultBigInt >= BigInt(0)).toBe(true)
    })
  })

  describe('deterministic output', () => {
    it('returns same output for same input', () => {
      const input = 'consistent-hash-value'
      const result1 = hashToAum(input)
      const result2 = hashToAum(input)

      expect(result1).toBe(result2)
    })

    it('returns different output for different inputs', () => {
      const result1 = hashToAum('input-one')
      const result2 = hashToAum('input-two')

      expect(result1).not.toBe(result2)
    })
  })

  describe('edge cases', () => {
    it('handles empty string input', () => {
      const result = hashToAum('')

      expect(result).toMatch(/^\d+$/)
      expect(BigInt(result) < TWO_POW_191).toBe(true)
    })

    it('handles hex string with 0x prefix', () => {
      const result = hashToAum('0x0')

      expect(result).toMatch(/^\d+$/)
      expect(BigInt(result) >= BigInt(0)).toBe(true)
    })

    it('handles long hash string', () => {
      const longHash = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      const result = hashToAum(longHash)

      expect(result).toMatch(/^\d+$/)
      expect(BigInt(result) < TWO_POW_191).toBe(true)
    })
  })
})
