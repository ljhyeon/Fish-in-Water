import { SvgIcon } from '@mui/material';

export function AuctionIcon({ selected, color }) {
  return (
    <SvgIcon viewBox="0 0 26 33" sx={{ fontSize: 26 }}>
      <path
        d="M1 11.1712C1 26.3712 2.33333 31.1712 3 31.6712H21C26.2 31.6712 25.8333 18.0046 25 11.1712"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M7.5 12.1712V28.6712"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13.5 12.1712V28.6712"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M19.5 11.6712C20.3 25.2712 19.8333 28.6712 19.5 28.6712"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M5.49988 10.6713C3.5 0.671252 21 -4.82875 21.9999 10.6713"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        fill="none"
      />
    </SvgIcon>
  );
}


export function Info({ selected, color }) {

  return (
    <SvgIcon viewBox="0 0 34 38" sx={{ width: 34, height: 34 }}>
      <path
        d="M11.9362 27.6633C9.45364 26.6131 7.39696 24.7575 6.09763 22.3957C4.79831 20.0339 4.33203 17.3035 4.77395 14.6443C5.21587 11.9852 6.54023 9.55226 8.53362 7.73767C10.527 5.92307 13.0733 4.83249 15.7621 4.64168C18.451 4.45086 21.1258 5.17093 23.3555 6.68583C25.5851 8.20073 27.2398 10.4222 28.0528 12.9923C28.8658 15.5624 28.7898 18.3314 27.837 20.853C26.8843 23.3746 25.1102 25.502 22.8008 26.8923"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        fill="none"
      />
      <path
        d="M11.7666 28C4.69725 34 4.31606 36.5 5.00913 37"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M22.7334 27C29.8027 33 30.1839 35.5 29.4909 36"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
}

export function Properties({ selected, color }) {

  return (
    <SvgIcon viewBox="0 0 52 28" sx={{ width: 30, height: 30 }}>
      <path
        d="M1 17.6667C39.7692 -2.43587 48.9487 9.29063 51 17.6667C41 27.4221 18.5385 37.7463 8.69231 1"
        stroke={color}
        strokeWidth={selected ? 4 : 2}
        fill="none"
      />
      <path
        d="M41.256 7.92307C36.3329 14.8974 38.6919 21.2564 40.4868 23.5641"
        stroke={color}
        strokeWidth={selected ? 4 : 2}
        fill="none"
      />
      <circle
        cx="43.4364"
        cy="13.1795"
        r="0.5"
        fill={color}
        stroke={selected ? 4 : 2}
        strokeWidth={0.282051}
      />
    </SvgIcon>
  );
}
