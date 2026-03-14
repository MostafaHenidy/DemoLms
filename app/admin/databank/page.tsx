"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Database,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  FileText,
  Video,
  ImageIcon,
  File,
  Pencil,
  Trash2,
  MoreVertical,
  Folder,
  Upload,
  HardDrive,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface FolderNode {
  id: number
  name: string
  order: number
  children: FolderNode[]
}

interface DatabankItem {
  id: number
  folderId: number | null
  path: string
  originalName: string
  type: string
  createdAt: string
}

export default function DatabankPage() {
  const { showToast } = useStore()
  const [folderTree, setFolderTree] = useState<FolderNode[]>([])
  const [flatFolders, setFlatFolders] = useState<{ id: number; name: string; parentId: number | null }[]>([])
  const [items, setItems] = useState<DatabankItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [renameFolderId, setRenameFolderId] = useState<number | null>(null)
  const [renameName, setRenameName] = useState("")
  const [moveItemId, setMoveItemId] = useState<number | null>(null)
  const [storage, setStorage] = useState<{ usedFormatted: string; limitFormatted: string } | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importType, setImportType] = useState<"pdf" | "word" | "video" | "image">("pdf")
  const [importFiles, setImportFiles] = useState<File[]>([])
  const [importing, setImporting] = useState(false)

  const loadStorage = async () => {
    try {
      const res = await fetch("/api/admin/databank/storage")
      const data = await res.json()
      if (res.ok) setStorage({ usedFormatted: data.usedFormatted, limitFormatted: data.limitFormatted })
    } catch {
      setStorage(null)
    }
  }

  const loadFolders = async () => {
    try {
      const res = await fetch("/api/admin/databank/folders")
      const data = await res.json()
      if (res.ok) {
        setFolderTree(data.folders ?? [])
        setFlatFolders(data.flat ?? [])
      } else {
        const msg = data.detail ? `${data.error}: ${data.detail}` : (data.error || "فشل تحميل المجلدات")
        showToast(msg, "error")
        setFolderTree([])
        setFlatFolders([])
      }
    } catch {
      setFolderTree([])
      setFlatFolders([])
    }
  }

  const loadItems = async (folderId: number | null) => {
    const q = folderId == null ? "root" : String(folderId)
    try {
      const res = await fetch(`/api/admin/databank/items?folderId=${q}`)
      const data = await res.json()
      setItems(res.ok ? (data.items ?? []) : [])
    } catch {
      setItems([])
    }
  }

  useEffect(() => {
    Promise.all([loadFolders(), loadItems(selectedFolderId), loadStorage()]).finally(() =>
      setLoading(false)
    )
  }, [])

  useEffect(() => {
    loadItems(selectedFolderId)
  }, [selectedFolderId])

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    setCreatingFolder(true)
    try {
      const res = await fetch("/api/admin/databank/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: selectedFolderId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.detail ? `${data.error}: ${data.detail}` : (data.error || "فشل إنشاء المجلد")
        throw new Error(msg)
      }
      setNewFolderName("")
      setNewFolderOpen(false)
      await loadFolders()
      showToast("تم إنشاء المجلد")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "فشل إنشاء المجلد", "error")
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleRenameFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (renameFolderId == null || !renameName.trim()) return
    try {
      const res = await fetch(`/api/admin/databank/folders/${renameFolderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "فشل التعديل")
      }
      setRenameFolderId(null)
      setRenameName("")
      await loadFolders()
      showToast("تم تعديل اسم المجلد")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "فشل التعديل", "error")
    }
  }

  const handleDeleteFolder = async (id: number) => {
    if (!confirm("حذف هذا المجلد وجميع المجلدات الفرعية؟ سيتم نقل الملفات إلى الجذر.")) return
    try {
      const res = await fetch(`/api/admin/databank/folders/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "فشل الحذف")
      }
      if (selectedFolderId === id) setSelectedFolderId(null)
      await loadFolders()
      await loadItems(selectedFolderId === id ? null : selectedFolderId)
      showToast("تم حذف المجلد")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "فشل الحذف", "error")
    }
  }

  const handleImportFromDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (importFiles.length === 0) {
      showToast("اختر ملفاً واحداً على الأقل", "error")
      return
    }
    setImporting(true)
    let ok = 0
    let errMsg = ""
    for (const file of importFiles) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", importType)
      if (selectedFolderId != null) formData.append("folderId", String(selectedFolderId))
      try {
        const res = await fetch("/api/admin/databank/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) {
          errMsg = data.error || "فشل الرفع"
          break
        }
        ok++
      } catch {
        errMsg = "فشل الاتصال"
        break
      }
    }
    setImporting(false)
    if (ok > 0) {
      setImportFiles([])
      setImportOpen(false)
      await loadItems(selectedFolderId)
      await loadStorage()
      showToast(ok === importFiles.length ? "تم استيراد الملفات" : `تم استيراد ${ok} من ${importFiles.length}`)
    }
    if (errMsg) showToast(errMsg, "error")
  }

  const handleMoveItem = async (itemId: number, targetFolderId: number | null) => {
    try {
      const res = await fetch(`/api/admin/databank/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: targetFolderId }),
      })
      if (!res.ok) throw new Error("فشل النقل")
      setMoveItemId(null)
      await loadItems(selectedFolderId)
      showToast("تم نقل الملف")
    } catch {
      showToast("فشل نقل الملف", "error")
    }
  }

  const getFolderPath = (folderId: number | null): string => {
    if (folderId == null) return "الجذر"
    const flat = flatFolders.find((f) => f.id === folderId)
    if (!flat) return "—"
    const parts: string[] = [flat.name]
    let pid = flat.parentId
    while (pid != null) {
      const p = flatFolders.find((f) => f.id === pid)
      if (!p) break
      parts.unshift(p.name)
      pid = p.parentId
    }
    return parts.join(" / ")
  }

  function FolderTree({ nodes, depth = 0 }: { nodes: FolderNode[]; depth?: number }) {
    return (
      <ul className="space-y-0.5">
        {nodes.map((node) => (
          <li key={node.id}>
            {node.children.length > 0 ? (
              <Collapsible defaultOpen={depth < 1}>
                <div
                  className="flex items-center gap-1 rounded-md py-1 pr-2"
                  style={{ paddingRight: "0.5rem", paddingLeft: depth * 12 + 8 }}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex shrink-0 items-center justify-center p-0.5 hover:bg-[#E2E8F0] rounded"
                    >
                      <ChevronRight className="h-4 w-4 text-[#64748B] data-[state=open]:rotate-90" />
                    </button>
                  </CollapsibleTrigger>
                  <FolderRow node={node} depth={depth} />
                </div>
                <CollapsibleContent>
                  <FolderTree nodes={node.children} depth={depth + 1} />
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <div
                className="flex items-center gap-1 rounded-md py-1 pr-2"
                style={{ paddingRight: "0.5rem", paddingLeft: depth * 12 + 8 }}
              >
                <span className="w-4 shrink-0" />
                <FolderRow node={node} depth={depth} />
              </div>
            )}
          </li>
        ))}
      </ul>
    )
  }

  function FolderRow({ node, depth }: { node: FolderNode; depth: number }) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSelectedFolderId(node.id)}
          className={`flex flex-1 min-w-0 items-center gap-2 rounded px-2 py-1 text-start text-sm ${
            selectedFolderId === node.id
              ? "bg-[#EFF6FF] text-[#2563EB]"
              : "hover:bg-[#F1F5F9] text-[#0F172A]"
          }`}
        >
          <FolderOpen className="h-4 w-4 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setRenameFolderId(node.id)
                setRenameName(node.name)
              }}
            >
              <Pencil className="h-4 w-4 me-2" />
              إعادة تسمية
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeleteFolder(node.id)}
            >
              <Trash2 className="h-4 w-4 me-2" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5 text-[#64748B]" />
      case "video":
        return <Video className="h-5 w-5 text-[#64748B]" />
      case "pdf":
      case "word":
        return <FileText className="h-5 w-5 text-[#64748B]" />
      default:
        return <File className="h-5 w-5 text-[#64748B]" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#64748B]">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">بنك البيانات</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            استيراد من الجهاز: PDF، Word، فيديو، صور. حد التخزين 100 جيجا. أنشئ مجلدات واعرض البيانات فيها.
          </p>
        </div>
        {storage && (
          <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
            <HardDrive className="h-5 w-5 text-[#64748B]" />
            <span className="text-sm font-medium text-[#0F172A]">
              {storage.usedFormatted} / {storage.limitFormatted}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        <Card className="w-full lg:w-72 shrink-0">
          <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
            <span className="font-medium text-sm">المجلدات</span>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setNewFolderOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              مجلد جديد
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                  selectedFolderId === null ? "bg-[#EFF6FF] text-[#2563EB]" : "hover:bg-[#F1F5F9]"
                }`}
              >
                <Database className="h-4 w-4" />
                الجذر
              </button>
            </div>
            {folderTree.length > 0 ? (
              <FolderTree nodes={folderTree} />
            ) : (
              <p className="text-xs text-[#94A3B8] py-2">لا توجد مجلدات. أنشئ مجلداً جديداً.</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-0">
          <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
            <p className="text-sm text-[#64748B]">{getFolderPath(selectedFolderId)}</p>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="h-4 w-4" />
              استيراد من الجهاز
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {items.length === 0 ? (
              <div className="py-12 text-center text-[#94A3B8]">
                <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد ملفات في هذا المجلد.</p>
                <p className="text-xs mt-1">
                  الملفات المرفوعة من الجهاز (غلاف الدورة، مرفقات الدروس) تُضاف تلقائياً إلى بنك البيانات.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] p-2 hover:bg-[#F8FAFC]"
                  >
                    {item.type === "image" ? (
                      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-[#E2E8F0]">
                        <Image
                          src={item.path}
                          alt={item.originalName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#F1F5F9]">
                        {typeIcon(item.type)}
                      </div>
                    )}
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 truncate text-sm text-[#2563EB] hover:underline"
                    >
                      {item.originalName}
                    </a>
                    <span className="text-xs text-[#94A3B8] shrink-0">({item.type})</span>
                    <DropdownMenu
                      open={moveItemId === item.id}
                      onOpenChange={(open) => setMoveItemId(open ? item.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          نقل إلى مجلد
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
                        <DropdownMenuItem onClick={() => handleMoveItem(item.id, null)}>
                          الجذر
                        </DropdownMenuItem>
                        {flatFolders.map((f) => (
                          <DropdownMenuItem
                            key={f.id}
                            onClick={() => handleMoveItem(item.id, f.id)}
                          >
                            {getFolderPath(f.id)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>استيراد من الجهاز</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleImportFromDevice} className="space-y-4">
            <p className="text-sm text-[#64748B]">
              PDF، Word، فيديو، صور. الحد الأقصى للمشروع 100 جيجا.
            </p>
            <div>
              <Label>نوع الملف</Label>
              <Select
                value={importType}
                onValueChange={(v) => setImportType(v as typeof importType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="video">فيديو</SelectItem>
                  <SelectItem value="image">صورة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الملف (أو عدة ملفات)</Label>
              <Input
                type="file"
                multiple
                accept={
                  importType === "pdf"
                    ? "application/pdf"
                    : importType === "word"
                      ? ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      : importType === "video"
                        ? "video/mp4,video/webm,video/quicktime,video/x-msvideo"
                        : "image/jpeg,image/png,image/webp,image/gif"
                }
                className="mt-1"
                onChange={(e) => setImportFiles(Array.from(e.target.files ?? []))}
              />
              {importFiles.length > 0 && (
                <p className="text-xs text-[#64748B] mt-1">
                  {importFiles.length} ملف محدد. سيتم الإضافة إلى: {getFolderPath(selectedFolderId)}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={importing || importFiles.length === 0}>
                {importing ? "جاري الاستيراد..." : "استيراد"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مجلد جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#0F172A]">الاسم</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="اسم المجلد"
                className="mt-1"
                autoFocus
              />
              {selectedFolderId != null && (
                <p className="text-xs text-[#64748B] mt-1">
                  داخل: {getFolderPath(selectedFolderId)}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setNewFolderOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={creatingFolder || !newFolderName.trim()}>
                {creatingFolder ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={renameFolderId != null} onOpenChange={(open) => !open && setRenameFolderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة تسمية المجلد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameFolder} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#0F172A]">الاسم</label>
              <Input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="اسم المجلد"
                className="mt-1"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRenameFolderId(null)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={!renameName.trim()}>
                حفظ
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
