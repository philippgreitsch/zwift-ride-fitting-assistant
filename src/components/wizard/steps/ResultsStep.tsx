import { useFitStore } from '@/store/fitStore'
import { calculateFitOutputs } from '@/lib/calculations'
import { AxisCard } from './results/AxisCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Static instruction text for each Zwift Ride adjustment axis (OUT-05).
 * These describe the physical adjustment procedure on the Zwift Ride hardware.
 *
 * IMPORTANT: These strings are LOW confidence (sourced from community reviews).
 * Verify against actual hardware or official Zwift documentation before publishing.
 * Reference: RESEARCH.md Open Question 2.
 */
const AXIS_INSTRUCTIONS = {
  saddleHeight:
    'Locate the saddle height adjustment lever on the right side of the seat post. Squeeze the lever, move the saddle to the target height, then release and lock. The Zwift Ride adjusts in discrete notch positions — set to the notch closest to the target mm.',
  saddleForeAft:
    'Use a 4 mm hex key to loosen the saddle rail clamp bolt underneath the saddle. Slide the saddle forward or backward to the target position, then re-tighten the bolt firmly.',
  handlebarHeight:
    'Locate the handlebar height adjustment lever on the left side of the stem. Squeeze the lever, move the bars to the target height, then release and lock. The Zwift Ride adjusts in discrete notch positions — set to the notch closest to the target mm.',
  handlebarReach:
    'Use a 4 mm hex key to loosen the stem clamp bolts. Slide the handlebar forward or backward to the target reach position, then re-tighten all stem bolts evenly.',
} as const

export function ResultsStep() {
  const inputs = useFitStore((s) => s.inputs)
  const resetStore = useFitStore((s) => s.resetStore)
  const outputs = calculateFitOutputs(inputs)

  const axes = [
    outputs.saddleHeight,
    outputs.saddleForeAft,
    outputs.handlebarHeight,
    outputs.handlebarReach,
  ]
  const hasAnyData = axes.some((axis) => axis !== null)

  // Pitfall 3: No data entered yet — show prompt instead of four empty cards
  if (!hasAnyData) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="pt-6">
            <p className="text-base text-zinc-500">
              Enter measurements in the steps above to see your Zwift Ride settings.
            </p>
          </CardContent>
        </Card>
        <Button
          variant="ghost"
          className="w-full sm:w-auto self-start text-zinc-500"
          onClick={resetStore}
        >
          ← Start over
        </Button>
      </div>
    )
  }

  // D-11: All non-null axes are out of range — show a summary error above the cards
  const showAllOutOfRangeError = outputs.allAxesOutOfRange === true

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Your Zwift Ride settings
      </h2>

      {showAllOutOfRangeError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/30 dark:bg-red-950 dark:text-red-300">
          <strong>All axes out of range.</strong> Your measurements fall entirely outside the Zwift
          Ride's adjustment limits. The values shown below are the closest achievable positions — the
          fit may feel significantly different from your road bike.
        </div>
      )}

      {/* OUT-04: Fixed display order — saddle height → fore/aft → bar height → bar reach */}
      <AxisCard
        label="Saddle Height"
        axis={outputs.saddleHeight}
        instruction={AXIS_INSTRUCTIONS.saddleHeight}
      />
      <AxisCard
        label="Saddle Fore/Aft"
        axis={outputs.saddleForeAft}
        instruction={AXIS_INSTRUCTIONS.saddleForeAft}
      />
      <AxisCard
        label="Bar Height"
        axis={outputs.handlebarHeight}
        instruction={AXIS_INSTRUCTIONS.handlebarHeight}
      />
      <AxisCard
        label="Bar Reach"
        axis={outputs.handlebarReach}
        instruction={AXIS_INSTRUCTIONS.handlebarReach}
      />

      {/* UX-04: Start over button — clears localStorage and resets to step 0 */}
      <Button
        variant="ghost"
        className="mt-2 w-full sm:w-auto self-start text-zinc-500"
        onClick={resetStore}
      >
        ← Start over
      </Button>
    </div>
  )
}
