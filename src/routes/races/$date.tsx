import { createFileRoute, Link } from '@tanstack/react-router'
import Papa from 'papaparse'
import {
  type ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable
} from '@tanstack/react-table'
import { useState } from 'react'
import { Container } from '../../components/layout.tsx'
import styled from 'styled-components'

interface ParsedRow {
  pos: string
  number: string
  name: string
  laps: string
  diff: string
  gap: string
  bestTime: string
  totalTime: string
  sector1: string
  sector2: string
  sector3: string
}

// Convert uppercase names from the CSV to regular name case.
// Rules:
// - Lowercase everything with locale, then capitalize each word.
// - Keep common Portuguese particles in lowercase when not the first word: da, de, do, das, dos, e.
// - Handle hyphenated and apostrophized names by capitalizing each segment.
// - Normalize common suffix like JR → Jr.
function titleCaseName(input: string): string {
  if (!input) return ''
  const lower = input.toLocaleLowerCase('pt-BR')
  const particles = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])
  const normalizeSuffix = (s: string) => (s === 'jr' ? 'Jr' : s)

  const cap = (s: string) => (s ? s[0].toLocaleUpperCase('pt-BR') + s.slice(1) : s)

  const capCompound = (s: string, sep: string): string =>
    s
      .split(sep)
      .map((part) => (part ? cap(part) : part))
      .join(sep)

  return lower
    .split(/\s+/)
    .map((word, idx) => {
      if (!word) return ''
      // Apostrophes and right single quotes
      if (word.includes("'") || word.includes('’')) {
        const replaced = word.replace(/’/g, "'")
        const [pre, post] = replaced.split("'", 2)
        const left = pre ? cap(pre) : ''
        const right = post ? capCompound(post, '-') : ''
        return right ? `${left}'${right}` : left
      }
      if (word.includes('-')) {
        return capCompound(word, '-')
      }
      // Keep particles (except when first word)
      if (idx > 0 && particles.has(word)) return word
      const norm = normalizeSuffix(word)
      return norm === word ? cap(word) : norm
    })
    .join(' ')
}

async function fetchCsv(date: string): Promise<ParsedRow[]> {
  const res = await fetch(`/races/${date}.csv`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load CSV for ${date}`)
  const text = await res.text()
  // Map CSV headers (Portuguese) to our ParsedRow keys
  const headerMap: Record<string, keyof ParsedRow> = {
    'Pos': 'pos',
    'No.': 'number',
    'Nome': 'name',
    'Voltas': 'laps',
    'Diff': 'diff',
    'Gap': 'gap',
    'Melhor Tempo': 'bestTime',
    'Total Tempo': 'totalTime',
    'S1': 'sector1',
    'S2': 'sector2',
    'S3': 'sector3',
  }
  const parsed = Papa.parse<ParsedRow>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => headerMap[h.trim()] ?? h,
  })
  // Filter out potential empty rows due to trailing newline
  return (parsed.data || [])
    .filter((r) => r && Object.values(r).some((v) => v && String(v).trim() !== ''))
    .map((r) => ({
      pos: r.pos ?? '',
      number: r.number ?? '',
      name: titleCaseName(r.name ?? ''),
      laps: r.laps ?? '',
      diff: r.diff ?? '',
      gap: r.gap ?? '',
      bestTime: r.bestTime ?? '',
      totalTime: r.totalTime ?? '',
      sector1: r.sector1 ?? '',
      sector2: r.sector2 ?? '',
      sector3: r.sector3 ?? '',
    }))
}

export const Route = createFileRoute('/races/$date')({
  loader: async ({ params }: { params: { date: string } }) => {
    const rows = await fetchCsv(params.date)
    console.log(rows)
    return { rows, date: params.date }
  },
  component: RaceTablePage,
})

const compare = (numA: number, numB: number) => {
  if (numA === numB) return 0
  return numA > numB ? 1 : -1
}

const formatmmssttt = (number: number) => {
  let output = ''
  if (number >= 60) {
    const minutes = Math.floor(number / 60)
    output += `${minutes}:`
    number -= minutes * 60
  }
  if (number >= 10) {
    output += `${number.toFixed(3)}`
  } else {
    output += `0${number.toFixed(3)}`
  }
  return output
}

const renderYmd = (date: string) => {
  // parse YYYYMMDD into 'DD de mês de YYYY' (pt-BR)
  if (!date) return ''
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(date.trim())
  if (!m) return date
  const [, y, mm, dd] = m
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ]
  const idx = Number(mm) - 1
  if (isNaN(idx) || idx < 0 || idx > 11) return date
  return `${dd} de ${months[idx]} de ${y}`
}

function RaceTablePage() {
  const { rows, date } = Route.useLoaderData() as { rows: ParsedRow[]; date: string }

  const parseTimeToMillis = (s: string): number => {
    // Supports formats like mm:ss.mmm, m:ss, ss.mmm, or hh:mm:ss.mmm
    if (!s) return Number.POSITIVE_INFINITY
    const parts = s.split(':').map((p) => p.trim())
    let totalMs = 0
    try {
      if (parts.length === 3) {
        // hh:mm:ss(.ms)
        const [hh, mm, ssms] = parts
        const [ss, ms = '0'] = ssms.split('.')
        totalMs =
          parseInt(hh || '0', 10) * 3600_000 +
          parseInt(mm || '0', 10) * 60_000 +
          parseInt(ss || '0', 10) * 1000 +
          parseInt((ms + '000').slice(0, 3), 10)
      } else if (parts.length === 2) {
        // mm:ss(.ms)
        const [mm, ssms] = parts
        const [ss, ms = '0'] = ssms.split('.')
        totalMs =
          parseInt(mm || '0', 10) * 60_000 +
          parseInt(ss || '0', 10) * 1000 +
          parseInt((ms + '000').slice(0, 3), 10)
      } else if (parts.length === 1) {
        // ss(.ms)
        const [ss, ms = '0'] = parts[0].split('.')
        totalMs = parseInt(ss || '0', 10) * 1000 + parseInt((ms + '000').slice(0, 3), 10)
      }
    } catch {}
    return isNaN(totalMs) ? Number.POSITIVE_INFINITY : totalMs
  }

  const columnHelper = createColumnHelper<ParsedRow>()

  const lapSortingFn = (rowA: Row<ParsedRow>, rowB: Row<ParsedRow>, columnId: string) => {
    const a = rowA.original[columnId as keyof ParsedRow].toLocaleLowerCase()
    const b = rowB.original[columnId as keyof ParsedRow].toLocaleLowerCase()
    if (a.includes('lap') && b.includes('lap')) {
      const numA = parseInt(a.split(' ')[0])
      const numB = parseInt(b.split(' ')[0])
      return compare(numA, numB)
    }
    if (a.includes('lap') && !b.includes('lap')) {
      return 1;
    }
    if (!a.includes('lap') && b.includes('lap')) {
      return -1;
    }
    return compare(parseFloat(a), parseFloat(b))
  }
  const columns = [
    columnHelper.accessor('pos', {}),
    columnHelper.accessor('number', {}),
    columnHelper.accessor('name', {}),
    columnHelper.accessor('laps', {
    }),
    columnHelper.accessor('diff', {
      sortingFn: lapSortingFn
    }),
    columnHelper.accessor('gap', {
      sortingFn: lapSortingFn
    }),
    columnHelper.accessor(row => parseTimeToMillis(row.bestTime), {
      header: 'Melhor volta',
      id: 'bestTime',
      cell: ({ row }) => row.original.bestTime,
    }),
    columnHelper.accessor(row => parseTimeToMillis(row.totalTime), {
      header: 'Tempo total',
      id: 'totalTime',
      cell: ({ row }) => row.original.totalTime,
    }),
    columnHelper.accessor(row => parseFloat(row.sector1), { header: 'Setor 1' }),
    columnHelper.accessor(row => parseFloat(row.sector2), { header: 'Setor 2' }),
    columnHelper.accessor(row => parseFloat(row.sector3), { header: 'Setor 3' }),
    columnHelper.accessor(row => parseFloat(row.sector1) + parseFloat(row.sector2) + parseFloat(row.sector3), {
      header: 'Volta ideal',
      id: 'idealLap',
      cell: ({ row }) => formatmmssttt(parseFloat(row.original.sector1) + parseFloat(row.original.sector2) + parseFloat(row.original.sector3)),
    })
  ]

  return (
    <Container>
      <StyledH1>
        <Link to="/">uTiming</Link>
        <small>/</small>
        <Link to="/races">Baterias</Link>
        <small>/</small>
        <span>Bateria de {renderYmd(date)}</span>
      </StyledH1>
      <DataTable columns={columns} data={rows} />
    </Container>
  )
}

const StyledH1 = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  padding: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: "Russo One", sans-serif;

  a, small {
    font-size: 0.75rem;
    color: rgba(126, 126, 126, 0.71);
  }
  
  a:hover {
    text-decoration: underline;
  }
`

const StyledTable = styled.table`
  margin-left: calc(-1rem - 1px);
  width: calc(100% + 2rem + 2px);
  border-collapse: collapse;
  font-size: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.32);

  th {
    background: rgba(0, 0, 0, 0.26);
    cursor: pointer;
    user-select: none;
    text-align: right;
    white-space: nowrap;
    padding: 0.25rem 0.5rem;
    font-family: "Russo One", sans-serif;
    font-size: 0.80rem;
    font-weight: 400;
    border-bottom: 1px solid rgba(255, 255, 255, 0.32);
    border-right: 1px solid rgba(255, 255, 255, 0.32);
    
    &:last-child {
      border-right: none;
    }

    &.name {
      text-align: left;
    }
  }

  tr {
    background: rgba(43, 43, 43, 0.66);
  }

  tr:nth-child(even) {
    background: rgba(93, 93, 93, 0.46);
  }

  tr:hover {
    background: rgba(175, 75, 0, 0.65);
    color: white;
  }

  td {
    text-align: right;
    white-space: nowrap;
    width: 1rem;
    padding: 0.25rem 0.5rem;
    font-family: "Doto", monospace;
    font-weight: bold;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    
    &:last-child {
      border-right: none;
    }

    &.name {
      text-align: left;
      width: 100%;
    }
  }
`

function DataTable<T extends object>({ columns, data }: { columns: ColumnDef<T>[]; data: T[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
      <StyledTable>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => {
                const handler = h.column.getToggleSortingHandler()
                const isSortable = !!handler
                const sortDir = h.column.getIsSorted() as false | 'asc' | 'desc'
                return (
                  <th
                    key={h.id}
                    onClick={handler}
                    title={isSortable ? 'Click to sort' : undefined}
                    className={h.id}
                  >
                    {h.isPlaceholder ? null : (
                      <span>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sortDir === 'asc' ? ' ▲' : sortDir === 'desc' ? ' ▼' : ''}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id}>
              {r.getVisibleCells().map((c) => (
                <td key={c.id} className={c.column.id}>
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
  )
}
