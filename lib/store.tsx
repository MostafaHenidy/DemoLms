"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { coursesData } from "./data"

// ─── Types ───────────────────────────────────────────────────────
interface User {
  id: string
  name: string
  email: string
  avatar: string
  phone?: string | null
}

interface CartItem {
  courseId: string
}

interface StoreContextType {
  // Auth
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void

  // Cart
  cart: CartItem[]
  addToCart: (courseId: string) => void
  removeFromCart: (courseId: string) => void
  isInCart: (courseId: string) => boolean
  clearCart: () => void
  cartCount: number
  cartTotal: number
  appliedCoupon: { code: string; discountType: "percentage" | "fixed"; discountValue: number; discountAmount: number } | null
  setAppliedCoupon: (coupon: { code: string; discountType: "percentage" | "fixed"; discountValue: number; discountAmount: number } | null) => void

  // Purchases
  purchasedCourses: string[]
  isPurchased: (courseId: string) => boolean
  checkout: () => boolean

  // Wishlist
  wishlist: string[]
  toggleWishlist: (courseId: string) => void
  isWishlisted: (courseId: string) => boolean

  // Toast
  toast: { message: string; type: "success" | "error" | "info" } | null
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

const StoreContext = createContext<StoreContextType | null>(null)

const STORAGE_KEYS = {
  user: "lms_user",
  cart: "lms_cart",
  purchased: "lms_purchased",
  wishlist: "lms_wishlist",
  accounts: "lms_accounts",
  appliedCoupon: "lms_applied_coupon",
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// ─── Provider ────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [purchasedCourses, setPurchasedCourses] = useState<string[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [toast, setToast] = useState<StoreContextType["toast"]>(null)
  const [hydrated, setHydrated] = useState(false)

  const [appliedCoupon, setAppliedCouponState] = useState<{
    code: string
    discountType: "percentage" | "fixed"
    discountValue: number
    discountAmount: number
  } | null>(null)

  useEffect(() => {
    setUser(loadFromStorage(STORAGE_KEYS.user, null))
    setCart(loadFromStorage(STORAGE_KEYS.cart, []))
    setPurchasedCourses(loadFromStorage(STORAGE_KEYS.purchased, []))
    setWishlist(loadFromStorage(STORAGE_KEYS.wishlist, []))
    setAppliedCouponState(loadFromStorage(STORAGE_KEYS.appliedCoupon, null))
    setHydrated(true)
  }, [])

  useEffect(() => { if (hydrated) saveToStorage(STORAGE_KEYS.user, user) }, [user, hydrated])
  useEffect(() => { if (hydrated) saveToStorage(STORAGE_KEYS.cart, cart) }, [cart, hydrated])
  useEffect(() => { if (hydrated) saveToStorage(STORAGE_KEYS.purchased, purchasedCourses) }, [purchasedCourses, hydrated])
  useEffect(() => { if (hydrated) saveToStorage(STORAGE_KEYS.wishlist, wishlist) }, [wishlist, hydrated])
  useEffect(() => { if (hydrated) saveToStorage(STORAGE_KEYS.appliedCoupon, appliedCoupon) }, [appliedCoupon, hydrated])

  const setAppliedCoupon = useCallback((coupon: typeof appliedCoupon) => {
    setAppliedCouponState(coupon)
  }, [])

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Auth
  const syncEnrollments = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`/api/enrollment?userId=${userId}`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.courses)) {
        setPurchasedCourses(data.courses.map((id: unknown) => String(id)))
      }
    } catch {
      // ignore sync errors for now
    }
  }, [])

  const syncWishlistFromDb = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`/api/wishlist?userId=${userId}`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.courses)) {
        setWishlist(data.courses.map((id: unknown) => String(id)))
      }
    } catch {
      // ignore
    }
  }, [])

  const register = useCallback(async (name: string, email: string, _password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: _password }),
      })
      if (!res.ok) return false
      const data = await res.json()
      const numericId = Number(data.user.id)
      const newUser: User = {
        id: String(numericId),
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatarUrl ?? "/user-avatar.png",
        phone: data.user.phone ?? null,
      }
      setUser(newUser)
      if (!Number.isNaN(numericId)) {
        await syncEnrollments(numericId)
        await syncWishlistFromDb(numericId)
      }
      showToast("تم إنشاء الحساب بنجاح! 🎉")
      return true
    } catch {
      return false
    }
  }, [showToast, syncEnrollments])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return false
      const data = await res.json()
      const numericId = Number(data.user.id)
      const loggedUser: User = {
        id: String(numericId),
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatarUrl ?? "/user-avatar.png",
        phone: data.user.phone ?? null,
      }
      setUser(loggedUser)
      if (!Number.isNaN(numericId)) {
        await syncEnrollments(numericId)
        await syncWishlistFromDb(numericId)
      }
      showToast(`مرحباً بعودتك، ${loggedUser.name}! 👋`)
      return true
    } catch {
      return false
    }
  }, [showToast])

  const logout = useCallback(() => {
    setUser(null)
    showToast("تم تسجيل الخروج", "info")
  }, [showToast])

  // Cart
  const addToCart = useCallback((courseId: string) => {
    const id = String(courseId)
    if (!id) return
    setCart((prev) => {
      if (prev.some((i) => i.courseId === id)) return prev
      showToast("تمت الإضافة إلى السلة ✓")
      return [...prev, { courseId: id }]
    })
  }, [showToast])

  const removeFromCart = useCallback((courseId: string) => {
    setCart((prev) => prev.filter((i) => i.courseId !== courseId))
    showToast("تم الحذف من السلة", "info")
  }, [showToast])

  const isInCart = useCallback((courseId: string) => cart.some((i) => i.courseId === courseId), [cart])

  const clearCart = useCallback(() => {
    setCart([])
    setAppliedCouponState(null)
  }, [])

  const cartCount = cart.length

  const cartTotal = cart.reduce((sum, item) => {
    const course = coursesData.find((c) => c.id === item.courseId)
    return sum + (course?.price ?? 0)
  }, 0)

  // Purchases
  const isPurchased = useCallback((courseId: string) => purchasedCourses.includes(courseId), [purchasedCourses])

  const checkout = useCallback(async () => {
    if (cart.length === 0) return false
    if (!user) {
      // fallback: local-only behavior
      const newPurchases = cart.map((i) => i.courseId).filter((id) => !purchasedCourses.includes(id))
      setPurchasedCourses((prev) => [...prev, ...newPurchases])
      setCart([])
      setAppliedCouponState(null)
      showToast("تم الشراء بنجاح! يمكنك الآن البدء بالتعلم 🎓")
      return true
    }

    try {
      const userIdNum = Number(user.id)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdNum,
          items: cart.map((i) => ({ courseId: Number(i.courseId) })),
          gateway: "cart",
          couponCode: appliedCoupon?.code ?? null,
          discountAmount: appliedCoupon?.discountAmount ?? 0,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error("Checkout failed", res.status, data)
        showToast(data?.error ?? "حدث خطأ أثناء إتمام الشراء", "error")
        return false
      }
      await syncEnrollments(userIdNum)
      setCart([])
      setAppliedCouponState(null)
      showToast("تم الشراء بنجاح! يمكنك الآن البدء بالتعلم 🎓")
      return true
    } catch (err) {
      console.error("Checkout error", err)
      showToast("حدث خطأ أثناء إتمام الشراء", "error")
      return false
    }
  }, [cart, purchasedCourses, showToast, user, syncEnrollments, appliedCoupon])

  // Wishlist
  const toggleWishlist = useCallback((courseId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(courseId)
      const next = exists ? prev.filter((id) => id !== courseId) : [...prev, courseId]

      if (user) {
        const userIdNum = Number(user.id)
        if (userIdNum && !Number.isNaN(userIdNum)) {
          // fire-and-forget sync with DB
          fetch("/api/wishlist", {
            method: exists ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userIdNum, courseId: Number(courseId) }),
          }).catch(() => {})
        }
      }

      showToast(
        exists ? "تم الحذف من المفضلة" : "تمت الإضافة إلى المفضلة ♥",
        exists ? "info" : "success",
      )
      return next
    })
  }, [showToast, user])

  const isWishlisted = useCallback((courseId: string) => wishlist.includes(courseId), [wishlist])

  return (
    <StoreContext.Provider
      value={{
        user, isLoggedIn: !!user, login, register, logout,
        cart, addToCart, removeFromCart, isInCart, clearCart, cartCount, cartTotal,
        appliedCoupon, setAppliedCoupon,
        purchasedCourses, isPurchased, checkout,
        wishlist, toggleWishlist, isWishlisted,
        toast, showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
