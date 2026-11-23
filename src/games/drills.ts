export interface Drill {
  prompt: string
  choices: string[]
  answer: number
  why: string
}

export const DRILLS: Record<number, Drill[]> = {
  1: [
    { prompt: 'Which store is fastest for a value the CPU is using right now?', choices: ['Disk', 'Main memory', 'A register', 'L3'], answer: 2, why: 'Registers sit inside the core. Everything else is farther away.' },
    { prompt: 'Modified Harvard, as used in current machines, splits which cache?', choices: ['Only RAM', 'L1 into instruction and data, with L2 unified', 'Every level', 'Nothing'], answer: 1, why: 'Split L1 feeds the pipeline. Lower levels stay unified.' },
    { prompt: 'Hyper-threading duplicates…', choices: ['The whole core', 'Registers and interrupt logic, not the execution unit', 'The disk', 'L3 only'], answer: 1, why: 'One execution unit is shared. The second thread waits its turn when the first stalls.' },
    { prompt: 'A program on disk starts running when…', choices: ['The disk head spins faster', 'It has been loaded into memory', 'The keyboard is polled', 'The compiler finishes'], answer: 1, why: 'The stored-program idea: the CPU fetches from memory, not from the disk.' },
    { prompt: 'Many writes to the same block favour which coherence policy?', choices: ['Write-update', 'Write-invalidate', 'No cache', 'Polling'], answer: 1, why: 'Invalidate once, then keep writing locally. Update would broadcast every store.' },
    { prompt: 'NORMA means…', choices: ['No remote memory access', 'Non-uniform shared memory', 'A bigger L1', 'Two cores'], answer: 0, why: 'Loosely coupled machines pass messages. NUMA still shares memory, just not at one speed.' },
  ],
  2: [
    { prompt: 'A loop that rereads one variable is mostly…', choices: ['Spatial locality', 'Temporal locality', 'A page fault', 'Wear levelling'], answer: 1, why: 'The same address is used again soon.' },
    { prompt: 'Walking a[0], a[1], a[2] is mostly…', choices: ['Spatial locality', 'A race', 'An interrupt', 'Swap'], answer: 0, why: 'Nearby addresses are used together.' },
    { prompt: 'DRAM differs from SRAM because DRAM…', choices: ['Needs a refresh', 'Is used for registers', 'Cannot be cached', 'Is read-only'], answer: 0, why: 'The capacitor leaks. SRAM holds the bit with a latch and is faster.' },
    { prompt: 'A keyboard is a…', choices: ['Block device', 'Character device', 'Frame', 'Inode'], answer: 1, why: 'It delivers a stream of bytes. Disks move blocks.' },
    { prompt: 'Memory-mapped I/O means device registers…', choices: ['Live at addresses you can load and store', 'Are only on the disk', 'Skip the kernel', 'Replace RAM'], answer: 0, why: 'The same load/store path reaches the device. The OS still gates who may use it.' },
    { prompt: 'NAND flash must…', choices: ['Erase before it can rewrite', 'Refresh like DRAM', 'Sit in a register', 'Be a character device'], answer: 0, why: 'You erase a block, then program it. Wear levelling spreads that cost.' },
  ],
  3: [
    { prompt: 'Which command lists names in the working directory?', choices: ['pwd', 'ls', 'grep', 'chmod'], answer: 1, why: 'ls lists. pwd prints the directory you are in.' },
    { prompt: 'Which command searches file contents for a pattern?', choices: ['find', 'grep', 'mv', 'cal'], answer: 1, why: 'grep filters lines. find walks names.' },
    { prompt: 'A hard link and the original name share…', choices: ['Nothing', 'An inode', 'A different inode each', 'The shell prompt'], answer: 1, why: 'Two directory entries, one inode, one set of bytes.' },
    { prompt: 'chmod changes…', choices: ['Permissions', 'The clock', 'The compiler', 'A process id'], answer: 0, why: 'It updates the mode bits on the inode.' },
    { prompt: 'A pipe sends…', choices: ['stdout of one command into stdin of the next', 'stderr to the disk always', 'A signal', 'The kernel image'], answer: 0, why: 'The shell connects the two file descriptors.' },
    { prompt: 'ps lists…', choices: ['Processes', 'Packets', 'Pages of a book', 'Passwords'], answer: 0, why: 'It is a snapshot of processes the kernel knows about.' },
  ],
  4: [
    { prompt: 'In the shell, which assignment is valid?', choices: ['x = 5', 'x=5', 'set x 5', 'x := 5'], answer: 1, why: 'No spaces around =. Spaces would run a command named x.' },
    { prompt: 'What does $# mean?', choices: ['The script name', 'The number of arguments', 'The last exit code', 'The home directory'], answer: 1, why: '$0 is the script name. $1 is the first argument. $# counts them.' },
    { prompt: 'What does echo $x print after x=5?', choices: ['x', '5', '$x', 'nothing'], answer: 1, why: 'The shell expands $x before echo runs.' },
    { prompt: 'A test [ -f notes.txt ] succeeds when…', choices: ['notes.txt is a regular file', 'notes.txt is a directory', 'the shell is root', 'notes.txt is empty only'], answer: 0, why: '-f is the file test. -d is the directory test.' },
    { prompt: 'break inside a loop…', choices: ['Leaves the loop', 'Skips one iteration', 'Exits the shell', 'Deletes the script'], answer: 0, why: 'continue skips to the next iteration. break leaves.' },
    { prompt: 'What does > out.txt do to a command?', choices: ['Appends stderr', 'Sends stdout into that file, replacing it', 'Pipes to wc', 'Reads the file'], answer: 1, why: '>> appends. < reads. > truncates and writes stdout.' },
  ],
  5: [
    { prompt: 'A program waiting on disk is in which state?', choices: ['Running', 'Waiting', 'New', 'Terminated'], answer: 1, why: 'It cannot use the CPU until the I/O completes.' },
    { prompt: 'Dispatch moves a process from…', choices: ['Ready to running', 'Running to waiting', 'Waiting to terminated', 'New to terminated'], answer: 0, why: 'The short-term scheduler picks a ready process and runs it.' },
    { prompt: 'A zombie is a process that…', choices: ['Is still executing', 'Has exited and still needs its parent to collect the status', 'Is swapped out', 'Has two threads'], answer: 1, why: 'The PCB remains so the parent can read the exit code.' },
    { prompt: 'Threads of one process share…', choices: ['Nothing', 'The address space', 'One program counter', 'One stack'], answer: 1, why: 'Each thread still has its own registers and stack.' },
    { prompt: 'A race happens when…', choices: ['The result depends on the order of updates to shared state', 'Two processes have private variables', 'The ready queue is empty', 'A file is read-only'], answer: 0, why: 'Private data cannot race. Shared data without a lock can.' },
    { prompt: 'A mutex around a shared increment provides…', choices: ['Mutual exclusion', 'More cores', 'A new address space', 'A faster disk'], answer: 0, why: 'Only one holder is inside the critical section.' },
  ],
  6: [
    { prompt: 'A container, compared with a virtual machine, usually…', choices: ['Boots a guest kernel', 'Shares the host kernel and starts faster', 'Cannot be isolated at all', 'Replaces the CPU'], answer: 1, why: 'The VM has its own kernel. The container is a process with namespaces.' },
    { prompt: 'An HLL virtual machine such as the JVM exists so that…', choices: ['One program runs on many operating systems', 'The disk is encrypted', 'Interrupts stop', 'Git can commit'], answer: 0, why: 'Write the program once. The VM absorbs the platform differences.' },
    { prompt: 'Abstraction, unlike virtualisation,…', choices: ['Hides an implementation behind an interface', 'Always starts a guest OS', 'Copies a disk image', 'Schedules warps'], answer: 0, why: 'Virtualisation builds a virtual stand-in. Abstraction only hides details.' },
    { prompt: 'A process VM is a good fit for…', choices: ['A debugger or an emulator', 'Replacing the power supply', 'Formatting a filesystem only', 'A GPU warp'], answer: 0, why: 'It virtualises one process, which is how many debuggers and emulators work.' },
    { prompt: 'System VMs became common because the OS…', choices: ['Is a resource manager that can hand out virtual machines', 'Cannot run processes', 'Forbids isolation', 'Stores source code'], answer: 0, why: 'Resource virtualisation is what a hypervisor sells to guests.' },
    { prompt: 'You would pick a VM over a container when you need…', choices: ['A different kernel from the host', 'The smallest startup time', 'To share one libc only', 'A shell alias'], answer: 0, why: 'A container cannot boot another kernel. A VM can.' },
  ],
  7: [
    { prompt: 'git add moves changes into…', choices: ['The working tree only', 'The index (staging)', 'A remote by itself', 'The stash always'], answer: 1, why: 'Working tree, index, commit. add fills the index.' },
    { prompt: 'git commit records…', choices: ['The index as a new snapshot', 'Only untracked files', 'The remote by force', 'A compiler warning'], answer: 0, why: 'Commit reads the index, not whatever happens to be unsaved in the editor.' },
    { prompt: 'git clone gives you…', choices: ['A full copy with history', 'Only the latest file', 'A pull request', 'A binary diff and nothing else'], answer: 0, why: 'Every clone is a backup. You can work offline.' },
    { prompt: 'A pull request is…', choices: ['A proposal to merge one branch into another', 'A forced push', 'A compiler pass', 'A container image'], answer: 0, why: 'The host (GitHub or similar) reviews the merge. Git itself has merge.' },
    { prompt: 'Centralised version control differs from Git because…', choices: ['History lives on one server', 'Every clone has the full history', 'There are no commits', 'Branches are illegal'], answer: 0, why: 'SVN-style tools need the server. Git is distributed.' },
    { prompt: 'A merge conflict means…', choices: ['Two changes touched the same lines and Git will not guess', 'The disk is full', 'The kernel panicked', 'The file is binary always'], answer: 0, why: 'You edit the overlap, then commit the resolution.' },
  ],
  8: [
    { prompt: 'A syntax error is found…', choices: ['At compile time, or when the interpreter parses the file', 'Only after the program has run for an hour', 'By the linker never', 'In the page table'], answer: 0, why: 'The text is illegal before it runs. A logic error can be syntactically fine.' },
    { prompt: 'A logic error is…', choices: ['A program that runs and produces the wrong answer', 'A missing semicolon only', 'A segfault by definition', 'A profiler sample'], answer: 0, why: 'The machine did what you wrote. You wrote the wrong thing.' },
    { prompt: 'Step over in a debugger…', choices: ['Runs a call as one step', 'Enters the callee', 'Quits the process', 'Clears all breakpoints'], answer: 0, why: 'Step into follows the call. Step over does not.' },
    { prompt: 'cProfile’s tottime is…', choices: ['Time spent in the function itself, excluding callees', 'Time including callees', 'The number of lines', 'Heap size'], answer: 0, why: 'cumtime includes the functions it calls. tottime does not.' },
    { prompt: 'A breakpoint…', choices: ['Stops the program at a chosen line', 'Deletes the source', 'Compiles faster', 'Flushes the cache'], answer: 0, why: 'You then inspect variables and the call stack.' },
    { prompt: 'Python is often both compiler and interpreter because…', choices: ['It compiles to bytecode, then a virtual machine runs that', 'It never parses the file', 'It emits a kernel', 'It skips exceptions'], answer: 0, why: 'The .pyc is bytecode. The VM executes it. A JIT may compile hot paths further.' },
  ],
  9: [
    { prompt: 'A GPU pays off when the work is…', choices: ['A little branching and a lot of the same math on many elements', 'One deeply serial chain', 'Mostly disk seeks', 'A single system call'], answer: 0, why: 'Thousands of lanes want the same instruction on different data.' },
    { prompt: 'An NVIDIA warp is…', choices: ['32 threads that share an instruction', 'A whole grid', 'The host CPU', 'A PCIe packet'], answer: 0, why: 'AMD’s matching group is a wavefront of 64.' },
    { prompt: 'How many warps does a block of 96 threads need?', choices: ['2', '3', '32', '96'], answer: 1, why: '96 / 32 = 3. The hardware schedules warps, not individual threads.' },
    { prompt: 'Branch divergence inside a warp…', choices: ['Serialises the two paths', 'Doubles the core count', 'Skips the memory transfer', 'Is free'], answer: 0, why: 'Threads that take the other side wait. Both paths are paid.' },
    { prompt: 'The host-device workflow starts by…', choices: ['Copying data to device memory and launching a kernel', 'Running the kernel on the CPU stack', 'Formatting the disk', 'Opening a shell'], answer: 0, why: 'The CPU is the host. The GPU is the device. The copy is often the slow part.' },
    { prompt: 'SIMT differs from a plain loop because…', choices: ['Many threads run the same instruction on their own data', 'Only one thread exists', 'There is no memory', 'The compiler is skipped'], answer: 0, why: 'Single instruction, multiple threads. That is the GPU’s deal.' },
  ],
  10: [
    { prompt: 'Which GPU memory is private to one thread and fastest?', choices: ['Global memory', 'Registers', 'Host RAM', 'The disk'], answer: 1, why: 'Registers, then shared/L1, then L2, then global, then the trip back to the host.' },
    { prompt: 'Shared memory is visible to…', choices: ['Threads in the same block', 'Every GPU on earth', 'Only the host', 'One warp and no one else ever'], answer: 0, why: 'The block is the sharing scope. Other blocks do not see it.' },
    { prompt: 'At 1.5 GHz, one cycle is about…', choices: ['0.67 ns', '1.5 ms', '67 ns', '1 second'], answer: 0, why: '1 / 1.5e9 seconds ≈ 0.67 nanoseconds.' },
    { prompt: 'Tiling a matrix multiply helps because…', choices: ['A tile is reused from shared memory instead of reloaded from global memory', 'It removes the need for threads', 'It skips the multiply', 'It stores the matrix on disk'], answer: 0, why: 'Global loads are expensive. Shared memory keeps the tile close.' },
    { prompt: 'Occupancy is about…', choices: ['How many warps can stay in flight on a multiprocessor', 'Disk fullness', 'How many files Git tracks', 'The battery percentage'], answer: 0, why: 'More warps in flight hide the wait for memory.' },
    { prompt: 'Two kernels with the same math can differ in speed because of…', choices: ['Memory traffic and divergence, not the arithmetic alone', 'The spelling of the function', 'The shell prompt', 'The inode number'], answer: 0, why: 'Tuning is mostly about where the bytes live and whether the warp stays together.' },
  ],
  11: [
    { prompt: 'Processes on different machines share data by…', choices: ['One stack', 'Messages, RPC, or a queue', 'A shared register file', 'The program counter'], answer: 1, why: 'There is no shared memory across the network unless you build it.' },
    { prompt: 'Horizontal scaling means…', choices: ['More machines', 'A faster CPU in the same box', 'A bigger disk only', 'Fewer requests'], answer: 0, why: 'Vertical scaling buys a bigger box. Horizontal adds boxes.' },
    { prompt: 'Replication buys…', choices: ['Copies for availability and read throughput', 'A smaller dataset', 'A single point of failure on purpose', 'Less network traffic always'], answer: 0, why: 'You pay in consistency and disk. You gain survival when one copy dies.' },
    { prompt: 'Partitioning buys…', choices: ['A way to split a dataset that does not fit on one node', 'A second kernel on one core', 'Fewer bytes on disk always', 'A GUI'], answer: 0, why: 'Each node owns a slice. A query may have to visit more than one.' },
    { prompt: 'HDFS-style storage keeps a block…', choices: ['On several nodes, often three', 'In one register', 'Only in the browser', 'Unreplicated by definition'], answer: 0, why: 'The replication factor is the number of copies. Three is the usual default.' },
    { prompt: 'A stateless service is easier to scale because…', choices: ['Any instance can answer the next request', 'Each request must hit the same process', 'The disk is the only state', 'Clients share one socket forever'], answer: 0, why: 'A load balancer can pick any healthy instance.' },
  ],
  12: [
    { prompt: 'Renting virtual machines and managing the OS yourself is…', choices: ['IaaS', 'SaaS', 'A spreadsheet', 'A compiler flag'], answer: 0, why: 'Infrastructure. You still patch the guest. The provider owns the hardware.' },
    { prompt: 'A hosted app you only configure, such as web mail, is…', choices: ['SaaS', 'IaaS', 'A hypervisor', 'A warp'], answer: 0, why: 'Software as a service. You do not see the machines.' },
    { prompt: 'A Type 1 hypervisor runs…', choices: ['On the bare metal', 'Inside another operating system', 'In the browser only', 'On the GPU'], answer: 0, why: 'Type 2 is hosted on an existing OS. Type 1 is the OS, in effect.' },
    { prompt: 'Elasticity means capacity…', choices: ['Grows and shrinks with demand', 'Is bought once and never changes', 'Is free of failures', 'Lives on one laptop'], answer: 0, why: 'That is the cloud’s practical promise. It is not a promise of zero outages.' },
    { prompt: 'Multi-tenancy means…', choices: ['Several customers share one physical machine, isolated from each other', 'One customer owns the building', 'Threads share a stack', 'Git branches share a commit'], answer: 0, why: 'The hypervisor or the container runtime is what keeps them apart.' },
    { prompt: 'You pick containers on cloud VMs when you want…', choices: ['Fast scale-out of one service, with VMs underneath for a hard boundary', 'A guest kernel per function call', 'To avoid orchestration entirely', 'To store bytes in a register'], answer: 0, why: 'Containers start quickly. The VM is still the isolation boundary between tenants.' },
  ],
  13: [
    { prompt: 'The tightest limit on a phone, compared with a desktop, is usually…', choices: ['Battery and heat', 'The number of Git remotes', 'The size of a warp', 'How many inodes the desktop has'], answer: 0, why: 'Power is P proportional to voltage squared times frequency. Heat and battery cap both.' },
    { prompt: 'An SoC packages…', choices: ['CPU, GPU, radios, and power control on one chip', 'Only a disk controller', 'A hypervisor and nothing else', 'The cloud region'], answer: 0, why: 'The phone is a computer. The modem and the GPU sit next to the CPU.' },
    { prompt: 'big.LITTLE pairs…', choices: ['Fast cores and efficient cores', 'Two disks', 'A compiler and a linker only', 'HTTP and a register'], answer: 0, why: 'The scheduler moves a task to the small cores when it can, and to the big cores when it must.' },
    { prompt: 'An Android app is killed under memory pressure because…', choices: ['The kernel reclaims a background process so the foreground can run', 'The GPU warp diverged', 'Git ran out of commits', 'The file was a symlink'], answer: 0, why: 'Mobile RAM is small. The system would rather restart a background app than jank the one you are touching.' },
    { prompt: 'A stateless API call from a phone should be prepared to…', choices: ['Retry, because the radio drops', 'Assume one packet always arrives', 'Hold a kernel lock', 'Write the inode directly'], answer: 0, why: 'Latency and loss are normal. Timeouts, retries, and a local cache are part of the client.' },
    { prompt: 'Edge computing means…', choices: ['Some of the work runs on the device instead of a distant server', 'Every byte goes to one region', 'The phone has no CPU', 'The cloud is switched off'], answer: 0, why: 'On-device models avoid a round trip when the network is slow or private data should stay put.' },
  ],
}
