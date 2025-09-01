"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Pagination, usePagination } from "@/components/ui/pagination"
import {
  IconBook,
  IconSearch,
  IconPlus,
  IconUserCheck,
  IconUserX,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCircleCheck,
  IconBarcode,
  IconCalendar,
  IconUsers,
  IconFileText,
  IconFilter,
} from "@tabler/icons-react"

// Sample library data
const books = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    category: "Fiction",
    status: "available",
    copies: { total: 5, available: 3, borrowed: 2 },
    location: "Shelf A-12",
    addedDate: "2023-09-15",
    lastBorrowed: "2024-01-10",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    category: "Fiction",
    status: "borrowed",
    copies: { total: 3, available: 0, borrowed: 3 },
    location: "Shelf B-08",
    addedDate: "2023-08-20",
    lastBorrowed: "2024-01-12",
  },
  {
    id: 3,
    title: "Chemistry Fundamentals",
    author: "Dr. Sarah Johnson",
    isbn: "978-1-234-56789-0",
    category: "Science",
    status: "available",
    copies: { total: 8, available: 6, borrowed: 2 },
    location: "Shelf C-15",
    addedDate: "2024-01-05",
    lastBorrowed: "2024-01-08",
  },
  {
    id: 4,
    title: "World History",
    author: "Prof. Michael Chen",
    isbn: "978-0-987-65432-1",
    category: "History",
    status: "overdue",
    copies: { total: 4, available: 1, borrowed: 3 },
    location: "Shelf D-22",
    addedDate: "2023-11-10",
    lastBorrowed: "2023-12-15",
  },
]

const borrowedBooks = [
  {
    id: 1,
    bookId: 2,
    bookTitle: "1984",
    studentName: "Alice Johnson",
    studentId: "STU001",
    borrowDate: "2024-01-12",
    dueDate: "2024-02-12",
    status: "active",
    avatar: "/avatars/student1.jpg",
  },
  {
    id: 2,
    bookId: 4,
    bookTitle: "World History",
    studentName: "Bob Smith",
    studentId: "STU002",
    borrowDate: "2023-12-15",
    dueDate: "2024-01-15",
    status: "overdue",
    avatar: "/avatars/student2.jpg",
  },
  {
    id: 3,
    bookId: 1,
    bookTitle: "To Kill a Mockingbird",
    studentName: "Carol Davis",
    studentId: "STU003",
    borrowDate: "2024-01-08",
    dueDate: "2024-02-08",
    status: "active",
    avatar: "/avatars/student3.jpg",
  },
]

const getStatusBadge = (status: string) => {
  const variants = {
    "available": "default",
    "borrowed": "secondary",
    "overdue": "destructive",
    "lost": "destructive",
    "damaged": "destructive",
  }
  const icons = {
    "available": <IconCircleCheck className="w-3 h-3 mr-1" />,
    "borrowed": <IconClock className="w-3 h-3 mr-1" />,
    "overdue": <IconAlertTriangle className="w-3 h-3 mr-1" />,
    "lost": <IconUserX className="w-3 h-3 mr-1" />,
    "damaged": <IconAlertTriangle className="w-3 h-3 mr-1" />,
  }
  return (
    <Badge variant={variants[status as keyof typeof variants] as any} className="flex items-center">
      {icons[status as keyof typeof icons]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getBorrowStatusBadge = (status: string) => {
  const variants = {
    "active": "default",
    "overdue": "destructive",
    "returned": "secondary",
  }
  return (
    <Badge variant={variants[status as keyof typeof variants] as any}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.isbn.includes(searchTerm)
    const matchesCategory = categoryFilter === "all" || book.category === categoryFilter
    const matchesStatus = statusFilter === "all" || book.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination logic
  const totalItems = filteredBooks.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex)

  const getLibraryStats = () => {
    const totalBooks = books.length
    const totalCopies = books.reduce((sum, book) => sum + book.copies.total, 0)
    const availableCopies = books.reduce((sum, book) => sum + book.copies.available, 0)
    const borrowedCopies = books.reduce((sum, book) => sum + book.copies.borrowed, 0)
    const overdueBooks = borrowedBooks.filter(book => book.status === "overdue").length

    return { totalBooks, totalCopies, availableCopies, borrowedCopies, overdueBooks }
  }

  const stats = getLibraryStats()

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Library Management</h1>
            <p className="text-muted-foreground">
              Manage books, circulation, and library resources
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconBarcode className="mr-2 h-4 w-4" />
              Scan Book
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                  <DialogDescription>
                    Add a new book to the library collection.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Book Title</label>
                    <Input placeholder="Enter book title" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Author</label>
                    <Input placeholder="Enter author name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ISBN</label>
                    <Input placeholder="Enter ISBN" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="literature">Literature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Copies</label>
                    <Input type="number" placeholder="1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input placeholder="Shelf location (e.g., A-12)" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Add Book</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <IconBook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">
                Unique titles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Copies</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableCopies}</div>
              <p className="text-xs text-muted-foreground">
                Ready for borrowing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borrowed Books</CardTitle>
              <IconUserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.borrowedCopies}</div>
              <p className="text-xs text-muted-foreground">
                Currently checked out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueBooks}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="books" className="space-y-4">
          <TabsList>
            <TabsTrigger value="books">Book Catalog</TabsTrigger>
            <TabsTrigger value="circulation">Circulation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Book Collection</CardTitle>
                <CardDescription>
                  Manage your library's book collection and inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="borrowed">Borrowed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                {/* Books Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Details</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Copies</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{book.title}</p>
                              <p className="text-sm text-muted-foreground">by {book.author}</p>
                              <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{book.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{book.copies.available}/{book.copies.total} available</p>
                              <p className="text-muted-foreground">{book.copies.borrowed} borrowed</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(book.status)}</TableCell>
                          <TableCell>{book.location}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {filteredBooks.length > 0 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="circulation" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current Borrowings</CardTitle>
                  <CardDescription>
                    Books currently checked out by students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {borrowedBooks.map((borrowed) => (
                    <div key={borrowed.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={borrowed.avatar} />
                          <AvatarFallback>
                            {borrowed.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{borrowed.bookTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {borrowed.studentName} • Due: {borrowed.dueDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getBorrowStatusBadge(borrowed.status)}
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            Return
                          </Button>
                          <Button variant="outline" size="sm">
                            Renew
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common library management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <IconUserCheck className="mr-2 h-4 w-4" />
                    Issue Book
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconUserX className="mr-2 h-4 w-4" />
                    Return Book
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconClock className="mr-2 h-4 w-4" />
                    Renew Book
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconAlertTriangle className="mr-2 h-4 w-4" />
                    Overdue Notices
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconFileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Circulation History</CardTitle>
                <CardDescription>
                  Recent borrowing and return activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 border rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">"To Kill a Mockingbird" returned by Alice Johnson</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">"Chemistry Fundamentals" borrowed by Bob Smith</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Overdue notice sent for "1984"</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Books</CardTitle>
                  <CardDescription>Most borrowed books this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>To Kill a Mockingbird</span>
                    <span className="font-medium">24 borrows</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>1984</span>
                    <span className="font-medium">18 borrows</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Chemistry Fundamentals</span>
                    <span className="font-medium">15 borrows</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Statistics</CardTitle>
                  <CardDescription>Library usage this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Borrowings</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Members</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average per Day</span>
                    <span className="font-medium">7.8</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collection Health</CardTitle>
                  <CardDescription>Status of library collection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Good Condition</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Needs Repair</span>
                      <span className="font-medium">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lost/Damaged</span>
                      <span className="font-medium">3%</span>
                    </div>
                    <Progress value={3} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Library Settings</CardTitle>
                <CardDescription>
                  Configure library policies and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Borrowing Period (days)</label>
                    <Input type="number" defaultValue="14" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Books per Student</label>
                    <Input type="number" defaultValue="3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Overdue Fine (per day)</label>
                    <Input type="number" defaultValue="0.50" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grace Period (days)</label>
                    <Input type="number" defaultValue="3" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Library Hours</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opening Time</label>
                      <Input type="time" defaultValue="08:00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Closing Time</label>
                      <Input type="time" defaultValue="17:00" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}