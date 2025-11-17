import ClipLoader from "react-spinners/ClipLoader"

export default function Spinner({ loading }) {
    return (
        <div className="flex items-center justify-center w-screen h-screen">
            <ClipLoader color="#C4A77D" loading={loading} size={50} />
        </div>
    )
}
