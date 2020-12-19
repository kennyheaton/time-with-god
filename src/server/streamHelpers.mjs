function getString(stream) {
    return new Promise((resolve, reject) => {
        let data = '';
        stream.on('data', (chunk) => {
            data += chunk;
        })
        .on('error', (err) => {
            reject(err);
        })
        .on('end', () => {
            resolve(data);
        });
    });
}

export { getString };