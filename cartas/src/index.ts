export function load(): void {
  console.log(`cartas memory_size: ${memory.size().toString()}`)
  const d = measure_text(0, "Hello World")
  console.log(`cartas measure (in load): ${d.width.toString()}x${d.height.toString()}`)
}