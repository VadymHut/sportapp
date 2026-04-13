import {useMemo, useRef, useState } from 'react';
import {
    useDataProvider,
    useNotify,
    usePermissions,
    useRedirect,
} from 'react-admin';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    LinearProgress,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import * as ExcelJS from 'exceljs';

type ImportEntity =
    | 'clients'
    | 'trainers'
    | 'memberships'
    | 'membership-plans'
    | 'plan-prices'
    | 'checkins'
    | 'staff'
    | 'app-users';

type ImportSummary = {
    severity: 'success' | 'info' | 'warning' | 'error';
    title: string;
    lines: string[];
};

type Choice = {
    id: ImportEntity;
    label: string;
    roles: string[];
    columnsHint: string;
    mapper: (row: Record<string, any>) => Record<string, any> | null;
};

const SUPPORTED_EXTENSIONS = ['csv', 'xlsx', 'xlsm'];

const hasRole = (permissions: any, role: string) => {
    if (Array.isArray(permissions)) return permissions.includes(role);
    return permissions === role;
};

const hasAnyRole = (permissions: any, roles: string[]) =>
    roles.some((role) => hasRole(permissions, role));

const normalizeKey = (key: string) =>
    String(key ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^\w]+/g, '_')
        .replace(/^_+|_+$/g, '');

const indexRow = (row: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.entries(row || {}).forEach(([k, v]) => {
        out[normalizeKey(k)] = typeof v === 'string' ? v.trim() : v;
    });
    return out;
};

const pick = (row: Record<string, any>, ...keys: string[]) => {
    for (const key of keys) {
        const value = row[normalizeKey(key)];
        if (value !== undefined && value !== null && value !== '') return value;
    }
    return undefined;
};

const toText = (value: any): string | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
};

const toNumber = (value: any): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = Number(String(value).trim());
    return Number.isNaN(n) ? undefined : n;
};

const toRole = (value: any): string | undefined => {
    if (value == null || value === '') return undefined;
    const raw = String(value).trim().toUpperCase();
    if (!raw) return undefined;
    return raw.startsWith('ROLE_') ? raw : `ROLE_${raw}`;
};

const prune = (obj: Record<string, any>) =>
    Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );

const mapClient = (rawRow: Record<string, any>) => {
    const row = indexRow(rawRow);
    return prune({
        name: toText(pick(row, 'name', 'first_name', 'firstname')),
        surname: toText(pick(row, 'surname', 'last_name', 'lastname')),
        personalCode: toText(pick(row, 'personal_code', 'personalcode')),
        email: toText(pick(row, 'email')),
        joinedOn: toText(pick(row, 'joined_on', 'joinedon', 'join_date', 'joindate')),
    });
};

const mapTrainer = (rawRow: Record<string, any>) => {
    const row = indexRow(rawRow);
    return prune({
        name: toText(pick(row, 'name', 'first_name', 'firstname')),
        surname: toText(pick(row, 'surname', 'last_name', 'lastname')),
        personalCode: toText(pick(row, 'personal_code', 'personalcode')),
        email: toText(pick(row, 'email')),
        joinedOn: toText(pick(row, 'joined_on', 'joinedon', 'join_date', 'joindate')),
        activity: toText(pick(row, 'activity')),
    });
};
const mapMembership = (rawRow: Record<string, any>) => {
    const row = indexRow(rawRow);

    const clientId = toNumber(pick(row, 'client_id', 'clientid', 'client'));
    const membershipPlanId = toNumber(
        pick(row, 'membership_plan_id', 'membershipplanid', 'membershipplan', 'plan_id', 'planid')
    );
    const trainerId = toNumber(pick(row, 'trainer_id', 'trainerid', 'trainer'));

    return prune({
        client: clientId != null ? { id: clientId } : undefined,
        membershipPlan: membershipPlanId != null ? { id: membershipPlanId } : undefined,
        trainer: trainerId != null ? { id: trainerId } : undefined,
        startingDate: toText(pick(row, 'starting_date', 'startingdate', 'start_date', 'startdate')),
    });
};

const mapMembershipPlan = (rawRow: Record<string, any>) => {
    const row = indexRow(rawRow);
    return prune({
        activityType: toText(pick(row, 'activity_type', 'activitytype', 'activity')),
        groupType: toText(pick(row, 'group_type', 'grouptype', 'group')),
        frequencyType: toText(pick(row, 'frequency_type', 'frequencytype', 'frequency')),
    });
};

const mapPlanPrice = (rawRow: Record<string, any>) => {
    const row = indexRow(rawRow);
    const membershipPlanId = toNumber(
        pick(row, 'membership_plan_id', 'membershipplanid', 'membershipplan', 'plan_id', 'planid')
    );

    return prune({
        membershipPlan: membershipPlanId != null ? { id: membershipPlanId } : undefined,
        price: toNumber(pick(row, 'price')),
        validFrom: toText(pick(row, 'valid_from', 'validfrom')),
        validTo: toText(pick(row, 'valid_to', 'validto')),
    });
};

const mapCheckIn = (rawRow: Record<string, any>) => {
    const row = indexRow(rawRow);
    const membershipId = toNumber(
        pick(row, 'membership_id', 'membershipid', 'membership')
    );
    const staffId = toNumber(pick(row, 'staff_id', 'staffid', 'staff'));

    return prune({
        membership: membershipId != null ? { id: membershipId } : undefined,
        staff: staffId != null ? { id: staffId } : undefined,
        visitedAt: toText(pick(row, 'visited_at', 'visitedat')),
    });
};

const mapStaff = (rawRow: Record<string, any>) => {
    const row = indexRow(rawRow);
    return prune({
        name: toText(pick(row, 'name', 'first_name', 'firstname')),
        surname: toText(pick(row, 'surname', 'last_name', 'lastname')),
        personalCode: toText(pick(row, 'personal_code', 'personalcode')),
        email: toText(pick(row, 'email')),
        jobTitle: toText(pick(row, 'job_title', 'jobtitle')),
        joinedOn: toText(pick(row, 'joined_on', 'joinedon', 'join_date', 'joindate')),
    });
};

const mapAppUser = (rawRow: Record<string, any>) => {
    const row = indexRow(rawRow);
    const staffId = toNumber(pick(row, 'staff_id', 'staffid', 'staff'));

    return prune({
        staff: staffId != null ? { id: staffId } : undefined,
        role: toRole(pick(row, 'role')),
        login: toText(pick(row, 'login', 'username')),
        password: toText(pick(row, 'password')),
    });
};

const ENTITY_CHOICES: Choice[] = [
    {
        id: 'clients',
        label: 'Clients',
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'],
        columnsHint: 'name, surname, personalCode, email, joinedOn',
        mapper: mapClient,
    },
    {
        id: 'trainers',
        label: 'Trainers',
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'],
        columnsHint: 'name, surname, personalCode, email, joinedOn, activity',
        mapper: mapTrainer,
    },
    {
        id: 'memberships',
        label: 'Memberships',
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'],
        columnsHint: 'clientId, membershipPlanId (or planId), trainerId (optional), startingDate',
        mapper: mapMembership,
    },
    {
        id: 'membership-plans',
        label: 'Membership Plans',
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'],
        columnsHint: 'activityType, groupType, frequencyType',
        mapper: mapMembershipPlan,
    },
    {
        id: 'plan-prices',
        label: 'Plan Prices',
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'],
        columnsHint: 'membershipPlanId (or planId), price, validFrom, validTo',
        mapper: mapPlanPrice,
    },
    {
        id: 'checkins',
        label: 'Check-ins',
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'],
        columnsHint: 'membershipId, staffId, visitedAt',
        mapper: mapCheckIn,
    },
    {
        id: 'staff',
        label: 'Staff',
        roles: ['ROLE_ADMIN'],
        columnsHint: 'name, surname, personalCode, email, jobTitle, joinedOn',
        mapper: mapStaff,
    },
    {
        id: 'app-users',
        label: 'Users',
        roles: ['ROLE_ADMIN'],
        columnsHint: 'staffId, role, login, password',
        mapper: mapAppUser,
    },
];

const detectCsvDelimiter = (headerLine: string) => {
    const candidates = [',', ';', '\t'];
    let best = ',';
    let bestCount = -1;

    for (const candidate of candidates) {
        const count = headerLine.split(candidate).length;
        if (count > bestCount) {
            best = candidate;
            bestCount = count;
        }
    }

    return best;
};

const parseCsvLine = (line: string, delimiter: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === delimiter && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    values.push(current.trim());
    return values;
};

const parseCsv = (text: string): Record<string, any>[] => {
    const cleaned = text.replace(/^\uFEFF/, '');
    const lines = cleaned.split(/\r?\n/).filter((line) => line.trim() !== '');

    if (!lines.length) return [];

    const delimiter = detectCsvDelimiter(lines[0]);
    const headers = parseCsvLine(lines[0], delimiter).map((header) => header.trim());

    if (!headers.length) return [];

    const rows: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i += 1) {
        const values = parseCsvLine(lines[i], delimiter);
        const row: Record<string, any> = {};
        let hasAnyValue = false;

        headers.forEach((header, idx) => {
            const value = values[idx] ?? '';
            row[header] = String(value).trim();
            if (String(value).trim() !== '') {
                hasAnyValue = true;
            }
        });

        if (hasAnyValue) {
            rows.push(row);
        }
    }

    return rows;
};

const excelValueToPlain = (value: unknown): string => {
    if (value == null) return '';

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value).trim();
    }

    if (typeof value === 'object') {
        const v = value as any;

        if ('text' in v && v.text != null) return String(v.text).trim();
        if ('hyperlink' in v && v.text != null) return String(v.text).trim();
        if ('result' in v && v.result != null) return String(v.result).trim();
        if ('richText' in v && Array.isArray(v.richText)) {
            return v.richText.map((part: any) => part?.text ?? '').join('').trim();
        }
    }

    return String(value).trim();
};

const parseExcelFile = async (ab: ArrayBuffer): Promise<Record<string, any>[]> => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(ab);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];

    for (let col = 1; col <= headerRow.cellCount; col += 1) {
        const headerValue = excelValueToPlain(headerRow.getCell(col).value);
        headers.push(headerValue);
    }

    if (!headers.some((h) => h !== '')) return [];

    const rows: Record<string, any>[] = [];

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        const obj: Record<string, any> = {};
        let hasAnyValue = false;

        for (let col = 1; col <= headers.length; col += 1) {
            const header = headers[col - 1];
            if (!header) continue;

            const value = excelValueToPlain(row.getCell(col).value);
            obj[header] = value;

            if (value !== '') {
                hasAnyValue = true;
            }
        }

        if (hasAnyValue) {
            rows.push(obj);
        }
    }

    return rows;
};

const parseSpreadsheet = async (file: File): Promise<Record<string, any>[]> => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        throw new Error('Unsupported file type. Use .csv, .xlsx, or .xlsm.');
    }

    const ab = await file.arrayBuffer();

    if (ext === 'csv') {
        const text = new TextDecoder().decode(ab);
        return parseCsv(text);
    }

    return parseExcelFile(ab);
};

const getErrorMessage = (error: any) =>
    error?.body?.message ||
    (typeof error?.body === 'string' ? error.body : '') ||
    error?.message ||
    'Unknown error';

const ImportDataPage = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    const [entity, setEntity] = useState<ImportEntity | ''>('');
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [summary, setSummary] = useState<ImportSummary | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const canUseImport = hasAnyRole(permissions, ['ROLE_ADMIN', 'ROLE_CASHIER']);

    const allowedChoices = useMemo(
        () => ENTITY_CHOICES.filter((c) => hasAnyRole(permissions, c.roles)),
        [permissions]
    );

    const currentChoice = allowedChoices.find((c) => c.id === entity);

    const handlePickFile = () => inputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const picked = event.target.files?.[0] ?? null;
        setFile(picked);
        setSummary(null);
    };

    const handleImport = async () => {
        if (!entity || !file || !currentChoice) return;

        setBusy(true);
        setSummary(null);

        try {
            const rows = await parseSpreadsheet(file);

            if (!rows.length) {
                setSummary({
                    severity: 'info',
                    title: 'No insertions',
                    lines: ['The file contains no data rows.'],
                });
                return;
            }

            let inserted = 0;
            const failures: string[] = [];

            for (let i = 0; i < rows.length; i += 1) {
                const row = rows[i];
                const rowNumber = i + 2;
                const payload = currentChoice.mapper(row);

                if (!payload || !Object.keys(payload).length) {
                    failures.push(`Row ${rowNumber}: empty or unsupported row format.`);
                    continue;
                }

                try {
                    await dataProvider.create(currentChoice.id, { data: payload });
                    inserted += 1;
                } catch (error: any) {
                    failures.push(`Row ${rowNumber}: ${getErrorMessage(error)}`);
                }
            }

            if (inserted === rows.length) {
                const message = `Imported ${inserted} row(s) successfully.`;
                setSummary({
                    severity: 'success',
                    title: 'Import successful',
                    lines: [message],
                });
                notify(message, { type: 'success' });
                return;
            }

            if (inserted > 0) {
                const title = `Inserted partly: ${inserted}/${rows.length} row(s).`;
                setSummary({
                    severity: 'warning',
                    title,
                    lines: failures.slice(0, 8),
                });
                notify(title, { type: 'warning' });
                return;
            }

            setSummary({
                severity: 'error',
                title: 'No insertions',
                lines: failures.length ? failures.slice(0, 8) : ['No rows were inserted.'],
            });
            notify('No rows were inserted.', { type: 'warning' });
        } catch (error: any) {
            const message = getErrorMessage(error);
            setSummary({
                severity: 'error',
                title: 'Import failed',
                lines: [message],
            });
            notify(message, { type: 'warning' });
        } finally {
            setBusy(false);
        }
    };

    if (permissionsLoading) {
        return (
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!canUseImport) {
        return (
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    py: 3,
                }}
            >
                <Card variant="outlined" sx={{ width: '100%', maxWidth: 760, borderRadius: 2 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                            Import data
                        </Typography>
                        <Alert severity="warning">
                            Import is available only for Admin and Cashier roles.
                        </Alert>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="outlined" onClick={() => redirect('/')}>
                                Back to dashboard
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 3,
            }}
        >
            <Card variant="outlined" sx={{ width: '100%', maxWidth: 860, borderRadius: 2 }}>
                <CardContent
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 0.5 }}>
                            Import data
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Choose an entity type, load a CSV or Excel file, and the system will submit one create request per row.
                        </Typography>
                    </Box>

                    <TextField
                        select
                        label="Entity type"
                        value={entity}
                        onChange={(e) => {
                            setEntity(e.target.value as ImportEntity);
                            setFile(null);
                            setSummary(null);
                            if (inputRef.current) inputRef.current.value = '';
                        }}
                        fullWidth
                        size="small"
                    >
                        {allowedChoices.map((choice) => (
                            <MenuItem key={choice.id} value={choice.id}>
                                {choice.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {currentChoice && (
                        <Alert severity="info">
                            Expected columns: <strong>{currentChoice.columnsHint}</strong>
                        </Alert>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".csv,.xlsx,.xlsm"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={handlePickFile}
                            disabled={!entity || busy}
                        >
                            {file ? 'Change file' : 'Choose file'}
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleImport}
                            disabled={!entity || !file || busy}
                        >
                            {busy ? 'Importing…' : 'Start import'}
                        </Button>
                    </Stack>

                    {file && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Selected file: <strong>{file.name}</strong>
                        </Typography>
                    )}

                    {busy && <LinearProgress />}

                    {summary && (
                        <Alert severity={summary.severity}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                                {summary.title}
                            </Typography>
                            {summary.lines.map((line, idx) => (
                                <Typography key={idx} variant="body2">
                                    {line}
                                </Typography>
                            ))}
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default ImportDataPage;