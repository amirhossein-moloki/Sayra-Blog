import json
from typing import Any, Dict, List, Tuple

def compare_responses(django_data: Any, playnest_data: Any, ignore_keys: List[str] = None) -> Tuple[str, str, Dict[str, Any]]:
    """
    Compares Django and PlayNest responses and classifies mismatches.
    """
    if ignore_keys is None:
        ignore_keys = ['id', 'created_at', 'updated_at', 'last_login', 'date_joined']

    diff = {}
    severity = 'NONE'
    status = 'MATCH'

    # Handle cases where one or both are not dicts (e.g. lists or primitives)
    if type(django_data) != type(playnest_data):
        return 'MISMATCH', 'CRITICAL', {'error': 'Type mismatch', 'django_type': str(type(django_data)), 'playnest_type': str(type(playnest_data))}

    if isinstance(django_data, dict):
        severity, diff = _compare_dicts(django_data, playnest_data, ignore_keys)
    elif isinstance(django_data, list):
        severity, diff = _compare_lists(django_data, playnest_data, ignore_keys)
    else:
        if django_data != playnest_data:
            severity = 'CRITICAL'
            diff = {'expected': django_data, 'actual': playnest_data}

    if severity != 'NONE':
        status = 'MISMATCH'

    return status, severity, diff

def _compare_dicts(d1: Dict, d2: Dict, ignore_keys: List[str]) -> Tuple[str, Dict]:
    severity = 'NONE'
    diff = {}

    all_keys = set(d1.keys()) | set(d2.keys())
    for k in all_keys:
        if k in ignore_keys:
            continue

        if k not in d1:
            diff[k] = {'status': 'extra_in_playnest', 'value': d2[k]}
            severity = _max_severity(severity, 'WARNING')
        elif k not in d2:
            diff[k] = {'status': 'missing_in_playnest', 'value': d1[k]}
            severity = _max_severity(severity, 'CRITICAL')
        else:
            res_status, res_sev, res_diff = compare_responses(d1[k], d2[k], ignore_keys)
            if res_status == 'MISMATCH':
                diff[k] = res_diff
                severity = _max_severity(severity, res_sev)

    return severity, diff

def _compare_lists(l1: List, l2: List, ignore_keys: List[str]) -> Tuple[str, Dict]:
    severity = 'NONE'
    diff = {}

    if len(l1) != len(l2):
        severity = 'CRITICAL'
        diff['length'] = {'expected': len(l1), 'actual': len(l2)}
        return severity, diff

    # Simple index-based comparison for now
    # In a more advanced version, we could try to match by some business key if ordering is unstable
    mismatches = []
    for i in range(len(l1)):
        res_status, res_sev, res_diff = compare_responses(l1[i], l2[i], ignore_keys)
        if res_status == 'MISMATCH':
            mismatches.append({'index': i, 'diff': res_diff})
            severity = _max_severity(severity, res_sev)

    if mismatches:
        diff['items'] = mismatches
        # If lengths match but items differ, and it's just ordering, we could classify as WARNING
        # But for now, we treat individual item mismatches as their own severity.

    return severity, diff

def _max_severity(s1: str, s2: str) -> str:
    order = {'NONE': 0, 'INFO': 1, 'WARNING': 2, 'CRITICAL': 3}
    if order[s1] >= order[s2]:
        return s1
    return s2
