
import { Skeleton } from "@/components/ui/skeleton"

export function ChatSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-end space-x-2 ${i % 2 === 0 ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <div className="space-y-2">
              <Skeleton className="h-10 w-48 rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MessageListSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      ))}
    </div>
  )
}
