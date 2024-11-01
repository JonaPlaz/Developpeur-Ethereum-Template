import { Terminal } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function Home() {
  return (
    <Alert className="bg-sky-200">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Hello</AlertTitle>
      <AlertDescription>
        Welcome on this App!
      </AlertDescription>
    </Alert>
  )
}
