import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ResultsStep() {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Your settings are ready
        </h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-base leading-relaxed text-zinc-950 dark:text-zinc-50">
          We've calculated your Zwift Ride target positions. Full adjustment guide coming in the next update.
        </p>
        <p className="text-sm text-zinc-500">
          Come back soon — or check the project for updates.
        </p>
      </CardContent>
    </Card>
  )
}
