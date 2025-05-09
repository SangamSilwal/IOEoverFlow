const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => {
                console.error('AsyncHandler caught:', err); // Debug log
                next(err); // Properly propagate the error
            });
    };
};

export { asyncHandler };