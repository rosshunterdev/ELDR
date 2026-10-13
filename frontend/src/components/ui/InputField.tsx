import styles from './InputField.module.css'

type Props = {
    label: string;
    type?: 'text' | 'email' | 'password' | 'tel';
    id: string;
    name: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({ label, type = 'text', id, name, onChange }: Props) {
    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={name}
                onChange={onChange}
                className={styles.input}
            />
        </div>
    )
}
