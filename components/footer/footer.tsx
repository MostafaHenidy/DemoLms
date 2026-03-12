"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Twitter, Linkedin, Youtube, Github, Send } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
}

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Github, href: "#", label: "GitHub" },
]

export function Footer() {
  const { locale, dir, t } = useI18n()

  const linkColumns = [
    {
      title: t("footer.platform"),
      links: [
        { label: t("footer.about"), href: "/about" },
        { label: t("footer.careers"), href: "/careers" },
        { label: t("footer.blog"), href: "/blog" },
        { label: t("footer.press"), href: "/press" },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { label: t("footer.helpCenter"), href: "/help" },
        { label: t("footer.contactUs"), href: "/contact" },
        { label: t("footer.faq"), href: "/faq" },
        { label: t("footer.status"), href: "/status" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), href: "/privacy" },
        { label: t("footer.terms"), href: "/terms" },
        { label: t("footer.cookies"), href: "/cookies" },
      ],
    },
  ]

  return (
    <footer dir={dir} className="relative bg-[#0F172A] text-white overflow-hidden pb-24 lg:pb-0">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#2563EB]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#0EA5E9]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          custom={0}
          className="py-12 lg:py-16 border-b border-white/10"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              {t("footer.newsletter.title")}
            </h3>
            <p className="text-white/50 text-sm sm:text-base mb-6">
              {t("footer.newsletter.subtitle")}
            </p>
            <div className={cn(
              "flex gap-2 max-w-md mx-auto",
              dir === "rtl" ? "flex-row-reverse" : "flex-row"
            )}>
              <Input
                type="email"
                placeholder={t("footer.newsletter.placeholder")}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]/50 focus-visible:border-[#2563EB]/50 h-11"
                dir={dir}
              />
              <Button className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white shadow-lg shadow-[#2563EB]/20 h-11 px-5 shrink-0">
                <Send className={cn("w-4 h-4", dir === "rtl" ? "ml-2 rotate-180" : "mr-2")} />
                {t("footer.newsletter.button")}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Grid */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-6">
            {/* Brand Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="col-span-2 md:col-span-3 lg:col-span-4"
            >
              <Link href="/" className="inline-flex items-center gap-2.5 group mb-5">
                <div className="relative w-9 h-9 overflow-hidden rounded-xl shadow-lg shadow-[#2563EB]/20 transition-shadow group-hover:shadow-xl group-hover:shadow-[#2563EB]/30 ring-1 ring-white/10">
                  <Image src="/company-logo.jpeg" alt="Anmka Academy" fill className="object-cover" sizes="36px" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  {locale === "ar" ? "أكاديمية أنمكا" : "Anmka Academy"}
                </span>
              </Link>
              <p className="text-white/45 text-sm leading-relaxed max-w-xs mb-6">
                {t("footer.brandDesc")}
              </p>
              <div className={cn("flex gap-2.5", dir === "rtl" ? "flex-row-reverse justify-end" : "")}>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-[#2563EB]/20 hover:text-[#2563EB] transition-all duration-200"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Link Columns */}
            {linkColumns.map((column, index) => (
              <motion.div
                key={column.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index + 1}
                className={cn(
                  "lg:col-span-2",
                  index === 0 && "lg:col-start-6"
                )}
              >
                <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="py-6 border-t border-white/10"
        >
          <div className={cn(
            "flex flex-col sm:flex-row items-center gap-4",
            dir === "rtl" ? "sm:flex-row-reverse" : ""
          )}>
            <p className="text-xs text-white/35">
              {t("footer.copyright")}
            </p>
            <div className={cn(
              "flex items-center gap-4 text-xs text-white/35",
              dir === "rtl" ? "sm:mr-auto" : "sm:ml-auto"
            )}>
              <Link href="/privacy" className="hover:text-white/70 transition-colors">
                {t("footer.privacy")}
              </Link>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <Link href="/terms" className="hover:text-white/70 transition-colors">
                {t("footer.terms")}
              </Link>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <Link href="/cookies" className="hover:text-white/70 transition-colors">
                {t("footer.cookies")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
