import { expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { PremiumUpsell } from "@/components/dashboard/premium-upsell"

test("PremiumUpsell renders title and description", () => {
  render(<PremiumUpsell />)

  expect(screen.getByText("Actualizá a Premium")).toBeDefined()
  expect(screen.getByText(/Perfil destacado/)).toBeDefined()
  expect(screen.getByText("Ver planes")).toBeDefined()
})

test("PremiumUpsell link goes to /premium", () => {
  render(<PremiumUpsell />)

  const link = screen.getByText("Ver planes").closest("a")
  expect(link).toHaveAttribute("href", "/premium")
})
