export const colourStyles = {
    control: (styles: object) => ({ ...styles, backgroundColor: '#fff', paddingTop: 4, paddingBottom: 4 }),
    option: (styles: any) => {
        return {
            ...styles,
            backgroundColor: '#fff',
            color: '#000',

            ':active': {
                ...styles[':active'],
                backgroundColor: '#9333ea36',
            },

            ':focused': {
                backgroundColor: '#9333ea36',
            }
        };
    },
    placeholder: (styles: object) => ({ ...styles, color: '#9333ea9e' }),
};
